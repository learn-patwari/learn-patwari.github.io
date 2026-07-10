# Akshay Patwari - Portfolio Website 🚀

A modern, animated portfolio website showcasing my skills, projects, and professional experience as a Software Engineer.

## ✨ Features

### 🎨 Design
- **Dark Theme** - Professional dark mode with gradient accents
- **Glassmorphism UI** - Modern glass-effect cards and components
- **Smooth Animations** - Floating orbs, typing effects, and scroll animations
- **Responsive Design** - Works perfectly on all devices

### 📱 Sections
- **Home** - Hero section with animated typing text and profile picture
- **About** - Professional summary with animated stats
- **Skills** - Interactive skill cards with proficiency levels
- **Projects** - GitHub repositories displayed as project cards
- **GitHub** - Live GitHub profile stats and metrics
- **LeetCode** - Problem-solving statistics and achievements
- **LinkedIn** - Professional experience timeline
- **Resume** - Download and view resume
- **Contact** - Contact information and message form

### 🔗 Routing System
The website uses a single-page application (SPA) routing system:
- `/` or `/#home` - Home page
- `/#about` - About section
- `/#skills` - Skills section
- `/#projects` - Projects section
- `/#github` - GitHub profile
- `/#leetcode` - LeetCode stats
- `/#linkedin` - LinkedIn experience
- `/#resume` - Resume download
- `/#contact` - Contact information

### 🌟 Animations
- Floating gradient orbs background
- Twinkling stars effect
- Typing animation for role titles
- Smooth section transitions
- Hover effects on all interactive elements
- Profile picture rotation animation
- Scroll-triggered fade-in animations

### 🔌 API Integrations
- **GitHub API** - Real-time repository and profile data
- **LeetCode API** - Live problem-solving statistics
- All data loads dynamically from third-party APIs

## 🚀 Setup & Usage

1. **Clone the repository**
   ```bash
   git clone https://github.com/learn-patwari/akshay-patwari-portfolio.git
   cd akshay-patwari-portfolio
   ```

2. **Open the website**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     python -m http.server 8000
     ```
   - Then navigate to `http://localhost:8000`

3. **Customize**
   - Update personal information in the HTML file
   - Add your resume PDF to enable download functionality
   - Modify colors in CSS variables (`:root` section)

## 📝 Configuration

### Personal Information
Update these variables in the JavaScript section:
- LinkedIn URL: Line 969
- GitHub username: `learn-patwari`
- LeetCode username: `akshayPatwari`
- Email: `akshaypatwariap@gmail.com`
- Phone: `+91 9164291810`
- Location: `Bengaluru, India`

### Resume Setup
To enable resume download:
1. Add your resume PDF file to the project folder
2. Update the download link in the resume section
3. Modify the `downloadResumeBtn` event handler

## 🎨 Color Customization

The color scheme can be modified in the CSS `:root` section:
```css
:root {
    --bg-primary: #0a0a0f;
    --bg-secondary: #141420;
    --accent-primary: #6366f1;
    --accent-secondary: #8b5cf6;
    --accent-tertiary: #ec4899;
    --text-primary: #e4e4e7;
    --text-secondary: #a1a1aa;
}
```

## 🛠️ Technologies Used
- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- GitHub REST API
- LeetCode Stats API

## 📊 Features Breakdown

### Dynamic Content Loading
- GitHub repositories fetched in real-time
- LeetCode stats updated automatically
- Profile picture loaded from LinkedIn
- Experience data rendered dynamically

### Performance Optimizations
- Lazy loading for API calls
- Smooth scroll behavior
- Optimized animations
- Minimal dependencies

## 🌐 Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 Mobile Responsive
The website is fully responsive and optimized for:
- Desktop (1920px+)
- Laptop (1366px)
- Tablet (768px)
- Mobile (320px+)

## 🤝 Contributing
Feel free to fork this project and customize it for your own portfolio!

## 📄 License
MIT License - feel free to use this template for your own portfolio

## 📧 Contact
- Email: akshaypatwariap@gmail.com
- LinkedIn: [linkedin.com/in/akshaypatwari](https://linkedin.com/in/akshaypatwari)
- GitHub: [github.com/learn-patwari](https://github.com/learn-patwari)

---

Made with ❤️ by Akshay Patwari
