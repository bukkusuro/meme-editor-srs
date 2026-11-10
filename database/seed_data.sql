-- Демонстрационные данные. BLOB — минимальный корректный PNG 1×1.
INSERT INTO fonts (font_id, name) VALUES (1, 'Impact'), (2, 'Arial'), (3, 'Georgia'), (4, 'Verdana');
INSERT INTO images (image_id, file_name, mime_type, data, width, height) VALUES
  (1, 'пример.png', 'image/png', X'89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360606060000000050001a5f645400000000049454e44ae426082', 1, 1);
INSERT INTO projects (project_id, name, canvas_width, canvas_height, background_color, image_id) VALUES
  (1, 'Пример с изображением', 1, 1, '#ffffff', 1),
  (2, 'Пустой холст', 1200, 1200, '#ffffff', NULL);
INSERT INTO text_layers (layer_id, project_id, font_id, content, position_x, position_y, font_size, text_color, alignment, is_bold, stroke_color, stroke_width, layer_order) VALUES
  (1, 2, 1, 'Когда всё получилось', 600, 100, 64, '#ffffff', 'center', 1, '#000000', 3, 0),
  (2, 2, 2, 'И тесты проходят', 600, 1000, 48, '#ffffff', 'center', 1, '#000000', 2, 1);
