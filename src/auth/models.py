from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, uid, email, display_name=None):
        self.id = uid
        self.email = email
        self.display_name = display_name