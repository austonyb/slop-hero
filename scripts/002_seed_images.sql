-- Seed data for the images table
INSERT INTO images (url, is_ai, source) VALUES
  ('https://images.unsplash.com/photo-1682687220742-aba13b6e50ba', false, 'Unsplash - Real Landscape'),
  ('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', false, 'Unsplash - Real Nature'),
  ('https://images.unsplash.com/photo-1441974231531-c6227db76b6e', false, 'Unsplash - Real Forest'),
  ('https://images.unsplash.com/photo-1472214103451-9374bd1c798e', false, 'Unsplash - Real Mountain'),
  ('https://images.unsplash.com/photo-1501854140884-074bf6bcb8ac', false, 'Unsplash - Real Lake'),
  
  -- Using placeholder images to represent AI images for now as requested
  ('https://placehold.co/600x400/png?text=AI+Generated+1', true, 'AI Placeholder 1'),
  ('https://placehold.co/600x400/png?text=AI+Generated+2', true, 'AI Placeholder 2'),
  ('https://placehold.co/600x400/png?text=AI+Generated+3', true, 'AI Placeholder 3'),
  ('https://placehold.co/600x400/png?text=AI+Generated+4', true, 'AI Placeholder 4'),
  ('https://placehold.co/600x400/png?text=AI+Generated+5', true, 'AI Placeholder 5');
