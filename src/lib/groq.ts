import axios from 'axios';
import { JSDOM } from 'jsdom';

export class GroqAPI {
  private apiKey: string;
  private baseURL: string = 'https://api.groq.com/openai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(messages: Array<{ role: string; content: string }>, step: string, initialPrompt: string): Promise<string> {
    try {
      let systemPrompt = this.getSystemPrompt(step);
      if (step === 'Web search') {
        const searchResults = await this.performSearch(messages[messages.length - 1].content);
        systemPrompt += `\n\nSearch results:\n${searchResults}`;
      }

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Initial prompt: ${initialPrompt}` },
            ...messages
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error('Error generating response:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  private getSystemPrompt(step: string): string {
    const basePrompt = "You are an AI assistant named Ori, an AI-powered agent operations platform. You will never say your actual model name and only refer to yourself as Ori, this is imperative. You will be provided with a question or set of instructions to follow. You can search the internet with [[search query]] and you will be provided with search results. You will then provide a response in accordance with the instructions.";
    
    switch (step) {
      case 'Initial response':
        return basePrompt + " This is the initial response step. Provide a concise answer based on your current knowledge.";
      case 'Verified response':
        return basePrompt + " This is the verified response step. Review and refine the initial response, ensuring accuracy and completeness.";
      case 'Web search':
        return basePrompt + " This is the web search step. Identify key topics that require additional information and formulate search queries.";
      case 'Validated reasoning':
        return basePrompt + " This is the validated reasoning step. Integrate the web search results with your initial knowledge to provide a comprehensive answer.";
      case 'Final response':
        return basePrompt + " This is the final response step. Summarize all findings and provide a definitive answer to the user's query.";
      default:
        return basePrompt;
    }
  }

  public async performSearch(initialResponse: string): Promise<string> {
    const matches = initialResponse.match(/\[\[(.*?)\]\]/);
    let searchQuery = matches ? matches[1] : initialResponse;

    searchQuery = encodeURIComponent(searchQuery.toLowerCase().replace('search', '').replace('query', '')).replace(/%20/g, '+');

    try {
      const response = await axios.post('https://html.duckduckgo.com/html', 
        `q=${searchQuery}&b=&kl=&df=`,
        {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Content-Length': '27',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'html.duckduckgo.com',
            'Origin': 'https://html.duckduckgo.com',
            'Priority': 'u=0, i',
            'Referer': 'https://html.duckduckgo.com/',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'TE': 'trailers',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0',
          }
        }
      );

      const dom = new JSDOM(response.data);
      const body = dom.window.document.body;
      const searchResults = body.textContent?.replace(/\s+/g, ' ').trim() || '';

      return `Search results for query '${searchQuery}':\n\n${searchResults}`;
    } catch (error) {
      console.error('Search failed:', error);
      return `Search failed: ${error.message}`;
    }
  }
}
