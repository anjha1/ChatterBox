import os

structure = {
    "ChatterBox": {
        "client": {
            "public": {},
            "src": {
                "assets": {},
                "components": {
                    "ChatWindow.jsx": "",
                    "MessageBubble.jsx": "",
                    "Sidebar.jsx": "",
                    "ContactList.jsx": "",
                },
                "pages": {
                    "Login.jsx": "",
                    "Register.jsx": "",
                    "Home.jsx": "",
                },
                "redux": {
                    "store.js": "",
                    "authSlice.js": "",
                    "chatSlice.js": "",
                },
                "App.js": "",
                "main.jsx": "",
                "index.css": "",
            }
        },
        "server": {
            "config": {
                "db.js": ""
            },
            "controllers": {
                "authController.js": "",
                "chatController.js": "",
                "messageController.js": ""
            },
            "models": {
                "User.js": "",
                "Chat.js": "",
                "Message.js": ""
            },
            "routes": {
                "authRoutes.js": "",
                "chatRoutes.js": "",
                "messageRoutes.js": ""
            },
            "middleware": {
                "authMiddleware.js": "",
                "errorHandler.js": ""
            },
            "socket": {
                "index.js": ""
            },
            "utils": {},  # Placeholder
            "server.js": "",
            ".env": ""
        },
        "README.md": "",
        "package.json": "",
        ".gitignore": ""
    }
}


def create_structure(base_path, struct):
    for name, content in struct.items():
        path = os.path.join(base_path, name)
        if isinstance(content, dict):
            os.makedirs(path, exist_ok=True)
            create_structure(path, content)
        else:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)


if __name__ == "__main__":
    create_structure(".", structure)
    print("✅ Folder structure created successfully!")
