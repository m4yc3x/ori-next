# Ori.wtf - AI-Powered Chat Platform

![Ori.wtf Example 1](examples/0.1.2a.png)
![Ori.wtf Example 2](examples/0.1.2b.png)

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
   ```
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

## 🤝 Contributing

You can contribute if you want!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Groq Console](https://console.groq.com/) for AI technology inspiration

---

Built with ❤️

