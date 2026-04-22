import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from flask_socketio import SocketIO

# Load environment variables from .env file
load_dotenv()

from config import config
from routes import api

socketio = SocketIO(cors_allowed_origins='*', async_mode='threading')

def create_app(config_name=None):
    """Application factory pattern."""
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    CORS(
        app,
        origins="*",
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["Content-Type", "Authorization", "Accept"],
        expose_headers=["Content-Type", "Authorization"],
        supports_credentials=False,
        max_age=600,
    )
    jwt = JWTManager(app)
    socketio.init_app(app)
    
    # Register blueprints
    app.register_blueprint(api, url_prefix='/api')

    # Register Socket.IO events after app and extensions are initialized.
    from socket_events import register_socket_events
    register_socket_events(socketio)
    
    return app


# Create the application instance
app = create_app()


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
