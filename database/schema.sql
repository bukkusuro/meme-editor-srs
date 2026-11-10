-- Учебная схема для SQLite. Хранение в приложении пока не подключено.
PRAGMA foreign_keys = ON;

CREATE TABLE images (
  image_id INTEGER PRIMARY KEY,
  file_name TEXT NOT NULL CHECK (length(trim(file_name)) > 0),
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp')),
  data BLOB NOT NULL CHECK (length(data) BETWEEN 1 AND 10000000),
  width INTEGER NOT NULL CHECK (width > 0),
  height INTEGER NOT NULL CHECK (height > 0)
);

CREATE TABLE fonts (
  font_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) > 0)
);

CREATE TABLE projects (
  project_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  canvas_width INTEGER NOT NULL CHECK (canvas_width > 0),
  canvas_height INTEGER NOT NULL CHECK (canvas_height > 0),
  background_color TEXT NOT NULL CHECK (background_color GLOB '#[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]'),
  image_id INTEGER REFERENCES images(image_id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE text_layers (
  layer_id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  font_id INTEGER NOT NULL REFERENCES fonts(font_id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  position_x REAL NOT NULL,
  position_y REAL NOT NULL,
  font_size INTEGER NOT NULL CHECK (font_size BETWEEN 8 AND 400),
  text_color TEXT NOT NULL CHECK (text_color GLOB '#[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]'),
  alignment TEXT NOT NULL CHECK (alignment IN ('left', 'center', 'right')),
  is_bold INTEGER NOT NULL CHECK (is_bold IN (0, 1)),
  stroke_color TEXT NOT NULL CHECK (stroke_color GLOB '#[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]'),
  stroke_width INTEGER NOT NULL CHECK (stroke_width BETWEEN 0 AND 30),
  layer_order INTEGER NOT NULL CHECK (layer_order >= 0),
  UNIQUE (project_id, layer_order)
);

CREATE INDEX idx_projects_image ON projects(image_id);
CREATE INDEX idx_text_layers_font ON text_layers(font_id);
-- UNIQUE(project_id, layer_order) одновременно индексирует выборку слоёв проекта.
