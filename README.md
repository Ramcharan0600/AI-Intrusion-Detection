# Real-time AI Intrusion Detection System

A sophisticated real-time intrusion detection system with visual attack simulation and AI-powered threat analysis. This project provides an interactive web dashboard for monitoring and responding to cyber threats.

## 🚀 Features

- **Real-time Attack Detection**: Monitor and detect suspicious login attempts and potential intrusions
- **Visual Attack Simulation**: Matrix-style animation and world map visualization of attack patterns
- **Interactive Response System**: Manual and automatic IP blocking capabilities
- **Attack Pattern Analysis**: AI-powered pattern recognition for different types of attacks
- **Live Statistics**: Real-time monitoring of attack counts, blocked IPs, and active threats
- **Geographic Visualization**: World map display showing attack origins and paths
- **Packet Visualization**: Real-time visualization of network packets during attacks

## 🛠️ Technologies Used

- **Backend**: Python with Flask web framework
- **Frontend**: HTML, JavaScript, CSS
- **Security**: IP-based intrusion detection and blocking
- **Visualization**: Custom CSS animations and interactive map
- **Data Storage**: File-based logging system

## 🚦 Getting Started

1. **Prerequisites**
   ```bash
   Python 3.x
   Flask
   ```

2. **Installation**
   ```bash
   # Clone the repository (✅ Already completed)
   git clone https://github.com/Ramcharan0600/AI-Intrusion-Detection.git

   # Navigate to the project directory (Next step ➡️)
   cd real_ids_app

   # Create a Python virtual environment (Optional but recommended)
   python -m venv venv
   
   # Activate the virtual environment
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/Mac:
   # source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Running the Application**
   ```git bash
   python app.py
   ```
   The application will be available at `http://localhost:5000`

## 💻 Usage

1. **Monitor Attacks**
   - View real-time statistics on the dashboard
   - Monitor active threats and attack patterns
   - Track blocked IPs and total attack attempts

2. **Simulate Attacks**
   - Use the "Generate New Attack" button to simulate realistic attack scenarios
   - Watch the visual representation of attacks on the world map
   - Observe matrix-style animations and packet visualization

3. **Respond to Threats**
   - Manually block suspicious IPs
   - View and manage blocked IP addresses
   - Clear all blocks when needed

## 🔒 Security Features

- IP-based threat detection
- Automated blocking of suspicious activity
- Manual override capabilities
- Real-time alert system
- Attack pattern recognition
- Geographic origin tracking

## 🎯 Attack Patterns

The system recognizes various attack patterns including:
- Brute Force Attacks
- Dictionary Attacks
- Targeted Attacks

Each pattern has unique characteristics and visual representations in the dashboard.

## 📊 Visualization Components

1. **World Map**
   - Shows attack origin and destination
   - Animated attack paths with moving dots
   - Real-time path visualization

2. **Matrix Animation**
   - Dynamic code-like display
   - Real-time updates during attacks

3. **Packet Visualization**
   - Animated network packet simulation
   - Visual representation of attack intensity

## 📁 Project Structure

```
real_ids_app/
├── app.py              # Main Flask application
├── detector.py         # Intrusion detection logic
├── block.sh           # IP blocking script
├── blocked_ips.txt    # Storage for blocked IPs
├── requirements.txt   # Python dependencies
├── templates/         # Frontend templates
│   └── index.html     # Main dashboard
├── static/         
│  ├── css/         # Page styles
│   └── style.css
│  ├── js/         # Interactive JS
│   └── dashboard.js      
└── logs/             # Log files
    └── cowrie/       # Honeypot logs
```

## 🔄 Updates and Maintenance

- Regularly update the blocked IP list
- Monitor system logs for unusual patterns
- Keep dependencies up to date
- Check for new attack patterns

## 📤 Pushing Code to GitHub

1. **Configure Git** (if not done already)
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

2. **Stage and Commit Changes**
   ```bash
   # Check status of your changes
   git status

   # Add all changes to staging
   git add .

   # Commit changes with a meaningful message
   git commit -m "Initial commit: Complete IDS implementation"
   ```

3. **Push to GitHub**
   ```bash
   # Push to main branch
   git push origin main
   ```

## 🤝 Contributing

Contributions to improve the system are welcome. Please follow these steps:
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## ⚠️ Disclaimer

This system is designed for educational and monitoring purposes. Always ensure proper authorization before deploying security monitoring tools in any environment.

## 📝 License

[MIT License] (or appropriate license)

## 🙏 Acknowledgments

- Inspired by real-world cyber security challenges
- Built with modern web technologies
- Community contributions and feedback
