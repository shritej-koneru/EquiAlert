# Contributing to EquiAlert

Thank you for your interest in contributing to EquiAlert! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork the Repository**
   ```bash
   git fork https://github.com/shritej-koneru/EquiAlert.git
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/EquiAlert.git
   cd EquiAlert
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Fill in your API keys and configuration
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Use Prettier for formatting
- Write meaningful commit messages

### Component Guidelines
- Use functional components with hooks
- Implement proper TypeScript types
- Follow the existing design system
- Ensure accessibility (ARIA labels, keyboard navigation)

### API Guidelines
- Use proper HTTP status codes
- Implement error handling
- Validate input with Zod schemas
- Document new endpoints

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable

## 💡 Feature Requests

For new features:
- Describe the use case
- Explain the proposed solution
- Consider impact on existing functionality
- Discuss UI/UX implications

## 📦 Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, documented code
   - Add tests if applicable
   - Update documentation

3. **Test Your Changes**
   ```bash
   npm run check  # TypeScript check
   npm run build  # Production build test
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format
Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 🎯 Priority Areas

We're particularly interested in contributions for:
- **Real-time Data Sources** - Additional Indian stock APIs
- **Chart Enhancements** - Technical indicators, advanced charting
- **Mobile Optimization** - PWA features, offline support
- **Performance** - Bundle optimization, caching strategies
- **Testing** - Unit tests, integration tests
- **Accessibility** - Screen reader support, keyboard navigation

## 📋 Code Review Process

1. All PRs require review before merging
2. Automated checks must pass (TypeScript, build)
3. Manual testing for UI changes
4. Documentation updates for new features

## 🏷️ Labels

We use these labels for issues and PRs:
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help newcomers get started
- Share knowledge and best practices
- Focus on constructive feedback

## 📞 Getting Help

- Open an issue for questions
- Check existing documentation
- Review similar projects for inspiration

Thank you for contributing to EquiAlert! 🚀