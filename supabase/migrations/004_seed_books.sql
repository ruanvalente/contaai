TRUNCATE TABLE books RESTART IDENTITY CASCADE;

INSERT INTO books (title, author, cover_color, description, category, pages, rating, rating_count, review_count) VALUES
('O Último Suspiro', 'Maria Silva', '#8B4513', 'Uma jornada emocional através das memórias de uma família que enfrenta os desafios do tempo.', 'Drama', 320, 4.5, 234, 89),
('Noites de Luar', 'João Pedro', '#2F4F4F', 'Em um mundo onde a magia e a tecnologia coexistem, uma jovem bruxa precisa decidir seu destino.', 'Fantasy', 412, 4.8, 567, 234),
('Fragmentos do Amanhã', 'Ana Clara', '#800020', 'Num futuro distante, a humanidade colonizou Marte. Uma expedição científica revela sinais de vida.', 'Sci-Fi', 380, 4.3, 189, 67),
('O Caminho do Sucesso', 'Ricardo Borges', '#1E3A5F', 'Um guia prático para alcançar seus objetivos profissionais e pessoais.', 'Business', 256, 4.1, 445, 156),
('Travessias', 'Carla Mendes', '#4A4A4A', 'Uma coletânea de contos que exploram a condição humana em suas múltiplas dimensões.', 'Drama', 298, 4.6, 321, 112),
('Além das Estrelas', 'Pedro Henrique', '#4B0082', 'Uma expedição científica revela sinais de vida em um planeta distante.', 'Sci-Fi', 445, 4.7, 623, 278),
('O Reino Encantado', 'Fernanda Costa', '#228B22', 'Quando um jovem príncipe herda um reino em ruínas, ele deve encontrar três artefatos mágicos.', 'Fantasy', 512, 4.4, 456, 189),
('Geografia Global', 'Marcos Oliveira', '#CD853F', 'Uma exploração abrangente dos fenômenos geográficos que moldam nosso planeta.', 'Geography', 342, 4.2, 234, 78),
('Métodos de Aprendizagem', 'Juliana Santos', '#6B8E23', 'Descubra técnicas comprovadas cientificamente para melhorar sua memória e concentração.', 'Education', 224, 4.0, 567, 234),
('A Arte da Negociação', 'Roberto Almeida', '#8B0000', 'Aprenda os segredos das negociações bem-sucedidas com estratégias utilizadas por especialistas.', 'Business', 288, 4.5, 789, 345),
('Mundos Paralelos', 'Lucas Ferreira', '#483D8B', 'Um físico descobre como viajar entre realidades alternativas.', 'Sci-Fi', 398, 4.6, 412, 167),
('Lendas do Norte', 'Sofia Rodrigues', '#2F4F4F', 'Vikings, deuses nórdicos e aventuras épicas se encontram nesta narrativa.', 'Fantasy', 456, 4.9, 534, 223);
