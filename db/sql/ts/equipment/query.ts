export const createEquipmentTable = `
CREATE TABLE equipment (
  equipment_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE
)
`;
