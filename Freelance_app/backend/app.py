import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import config
from routes import api


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
    
    # Register blueprints
    app.register_blueprint(api, url_prefix='/api')
    
    return app


# Create the application instance
app = create_app()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
