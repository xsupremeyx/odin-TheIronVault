# 🛡️ The Iron Vault

An RPG-inspired inventory management web application that transforms traditional CRUD functionality into an immersive, game-like experience. Items are organized into guild-style categories and presented with a cinematic, dark-themed UI.

---

##  Live Demo

 [odin-theironvault](https://odin-theironvault-production.up.railway.app/)

---

##  Key Features

-  **Guild-Based Structure**  
  Categories are reimagined as guilds/domains for a more immersive experience.

-  **Full Item Management**  
  Create, edit, and delete items with attributes like price, rarity, and quantity.

-  **Cinematic UI Design**  
  Dark theme with gold accents, responsive card layouts, and smooth hover interactions.

-  **Rarity System**  
  Visual rarity badges to distinguish item value.

-  **Secure Actions**  
  Admin password required for critical operations like deletion.

-  **Responsive Layout**  
  Optimized for desktop, tablet, and mobile devices.

---

## Tech Stack

- **Backend:** Node.js, Express.js  
- **Templating:** EJS  
- **Database:** PostgreSQL  
- **Styling:** Custom CSS (Flexbox + Grid + Variables + Responsive design)  

---

## 📂 Project Structure

```
.gitignore
README.md
app.js
.env
.env.example
package.json
[controllers]
    ├── categoryController.js
    └── itemController.js
[db]
    ├── pool.js
    ├── populatedb.js
    └── queries.js
package.json
[public]
    ├── [images]
        ├── armor.jpg
        ├── consumables.jpg
        ├── magic.jpg
        ├── melee.jpg
        ├── misc.jpg
        └── ranged.jpg
    └── styles.css
[routes]
    ├── categoryRouter.js
    ├── indexRouter.js
    └── itemRouter.js
[views]
    ├── categories.ejs
    ├── categoryDetail.ejs
    ├── categoryForm.ejs
    ├── error.ejs
    ├── itemDetail.ejs
    ├── itemForm.ejs
    ├── items.ejs
    ├── landing.ejs
    └── [partials]
        ├── error.ejs
        ├── footer.ejs
        ├── header.ejs
        └── navbar.ejs
```

---

## Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd project-folder
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup database
Ensure PostgreSQL is running and configured with the database name in `db/index.js`. Then run:

```bash
node populatedb.js
```

### 4. Start the server
```bash
npm start
```

Visit: http://localhost:3000

---

## 🎮 Concept

| Traditional App | The Iron Vault |
|----------------|----------------|
| Categories     | Guilds         |
| Items          | Wares / Items  |
| Store          | Vault          |

This design turns a standard inventory system into a game-like interface.

---

## 🎨 Design Highlights

- Dark fantasy UI with gold typography
- Responsive CSS Grid layout
- Cinematic 16:9 image cards
- Clean spacing using CSS variables
- Hover interactions for depth and feedback

---

##  Future Enhancements

-  Search and filtering
-  Advanced rarity effects (glow, animation)
-  Dashboard and analytics
-  Authentication system
-  Pagination for large datasets
-  Rehaul UI with a frontend framework (React)
---

## Learnings

- Building full-stack MVC applications with Node.js
- Designing scalable and reusable EJS templates
- Creating consistent UI systems using modern CSS
- Structuring relational data effectively
- Bridging backend logic with strong frontend design

---

## License

This project is open for learning and experimentation.

---

## Final Thought

This project focuses on elevating a standard CRUD application into a game-inspired experience that blends functionality with visual design.
