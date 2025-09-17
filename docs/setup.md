# Project Setup Guide

## Prerequisites

- Python 3.11 or higher
- Node.js (for frontend development)
- Git

## Installation

1. **Clone the Repository**
```bash
git clone https://github.com/jwheller0013/My-Collection-Project.git
cd My-Collection-Project
```

2. **Python Environment Setup**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. **Initialize Database**
```bash
cd My_Collection
python test_users.py
python genre_table.py
```

4. **Running the Application**

For Windows:
```bash
.\run.bat
```

For Unix-based systems:
```bash
chmod +x run.sh
./run.sh
```

For mobile devices (using Termux):
```bash
chmod +x run-mobile.sh
./run-mobile.sh
```

The application will be available at:
- Frontend: http://localhost:9000
- Backend API: http://localhost:8080

## Development Setup

### Frontend Development

The frontend code is located in the `My_Collection` directory. Main files:

- `*.html` - HTML templates
- `*.js` - JavaScript files
- `koley.css` - Main stylesheet
- `static/` - Static assets

### Backend Development

The backend is a Flask application with the following structure:

- `app.py` - Main application file
- `routes.py` - API routes
- `models.py` - Database models
- `user.py` - User authentication
- `tmdb_api.py` - TMDB API integration

### Testing

Run tests using:
```bash
python -m unittest discover -s My_Collection -p "test*.py"
```

## Configuration

### Environment Variables

The application uses the following environment variables:

- `FLASK_APP` - Flask application entry point
- `FLASK_ENV` - Development/Production environment
- `DATABASE_URL` - Database connection string
- `SECRET_KEY` - Application secret key

### API Keys

For full functionality, you'll need:

1. TMDB API key for movie/TV show data
2. OpenAI API key for AI recommendations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Known Issues and Troubleshooting

1. **Database Connection Issues**
   - Ensure SQLite database file exists
   - Check file permissions

2. **API Integration Issues**
   - Verify API keys are correctly configured
   - Check network connectivity

3. **Mobile Setup Issues**
   - Ensure Termux is installed from F-Droid
   - Check Python environment setup

## Support

For issues and support:
- Create an issue on GitHub
- Contact the maintainer: James Heller (https://www.linkedin.com/in/james-heller-xiii/)

## License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.