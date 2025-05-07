# deployment/environment.py
import os
from enum import Enum

class Environment(Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

def get_environment():
    return Environment(os.getenv("APP_ENV", "development"))