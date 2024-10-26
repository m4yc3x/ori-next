# Ori.wtf - AI-Powered Chat Platform

![Ori.wtf Example 1](example/0.1.2a.png)
![Ori.wtf Example 2](example/0.1.2b.png)

Ori.wtf is an advanced AI-powered chat platform that enhances your interactions with artificial intelligence. Experience seamless conversations and unlock the potential of AI-assisted communication.

## 🚀 Quick Start

### Prerequisites

- Node.js v18.19.1 or later
- MariaDB

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/m4yc3x/ori-wtf.git
   cd ori-wtf
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   Note: You may see 2 audit warnings. These can be safely ignored for now.

3. Set up the database:
   ```bash
   sudo mariadb -u root
   ```
   Then in the MariaDB prompt:
   ```sql
   CREATE DATABASE oridb;
   CREATE USER 'ori'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON oridb.* TO 'ori'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. Configure environment variables:
   Generate a secret:
   ```bash
   openssl rand -base64 32
   ```
   Create a `.env` file in the project root:
   ```bash
   DATABASE_URL="mysql://ori:password@localhost:3306/oridb"
   NEXTAUTH_SECRET="your-generated-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🛠 Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [DaisyUI](https://daisyui.com/) - UI components

## 🚀 Production

To deploy the application, follow the development instructions above, but instead of running `npm run dev`, run `npm run build`.

There will be linting errors due to the interactive nature of the code. These can be safely ignored:

*next.config.js* or *next.config.mjs*:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {ignoreDuringBuilds:true},typescript:{ignoreBuildErrors:true},
  // Add this eslint configuration
};

module.exports = nextConfig;
```

You will need to set the `DEFAULT_GROQ_KEY` environment variable to your Groq API key for free users.

Use `pm2` to keep the app running:

1. `npm install -g pm2`
2. `pm2 start npm --name "ori" -- start`
3. `pm2 startup` (*starts the application at boot*)
4. `pm2 save` (*saves the process list*)

## 🤝 Contributing

You can contribute if you want!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Groq Console](https://console.groq.com/) for AI technology inspiration

---

Built with ❤️

