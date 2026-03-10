import { Page, expect } from '@playwright/test';

export async function login(page: Page) {
  await page.getByTestId('email-input').fill('test@example.com');
  await page.getByTestId('password-input').fill('password123');
  await page.getByTestId('submit-btn').click();
  await page.getByTestId('sidebar').waitFor({ state: 'visible' });
}

export async function loginAndNavigateTo(page: Page, path: string) {
  await login(page);
  // Click the nav link for the given path
  const navMap: Record<string, string> = {
    '/dashboard': 'nav-dashboard',
    '/users': 'nav-users',
    '/wizard': 'nav-wizard',
    '/kanban': 'nav-kanban',
  };
  const testId = navMap[path];
  if (testId) {
    await page.getByTestId(testId).click();
  }
}

/**
 * Users sorted by name ascending (intended behavior).
 * These are all 50 users from the mock data sorted alphabetically by name.
 */
export const ALL_USERS_SORTED_BY_NAME_ASC = [
  { name: 'Aileen Pfeffer', email: 'Hannah0@yahoo.com', role: 'viewer', status: 'pending', department: 'Marketing', joinDate: '2023-03-27' },
  { name: 'Alfred Gislason', email: 'Elmira_Mills@gmail.com', role: 'viewer', status: 'pending', department: 'Design', joinDate: '2025-12-24' },
  { name: 'Antoinette Larson', email: 'Gertrude.Jerde@yahoo.com', role: 'editor', status: 'active', department: 'Sales', joinDate: '2026-01-29' },
  { name: 'Bennie Trantow', email: 'Audrey54@gmail.com', role: 'editor', status: 'inactive', department: 'Marketing', joinDate: '2024-03-10' },
  { name: 'Bertha Grimes-Runte', email: 'Lynda96@hotmail.com', role: 'admin', status: 'pending', department: 'Support', joinDate: '2024-12-08' },
  { name: 'Betsy Vandervort', email: 'Joseph60@yahoo.com', role: 'editor', status: 'inactive', department: 'Support', joinDate: '2024-12-18' },
  { name: 'Blaze Bergstrom', email: 'Esther.Baumbach@gmail.com', role: 'viewer', status: 'inactive', department: 'HR', joinDate: '2025-04-08' },
  { name: 'Bobbie Yost', email: 'Keenan.Larson35@hotmail.com', role: 'admin', status: 'inactive', department: 'Engineering', joinDate: '2024-11-22' },
  { name: 'Caesar Kulas', email: 'Evan.Blanda12@hotmail.com', role: 'admin', status: 'inactive', department: 'Design', joinDate: '2024-03-24' },
  { name: 'Carol Schumm', email: 'Karen68@hotmail.com', role: 'editor', status: 'pending', department: 'Design', joinDate: '2024-07-29' },
  { name: 'Chase Cormier-Johns', email: 'Annalise.Treutel19@yahoo.com', role: 'editor', status: 'inactive', department: 'Engineering', joinDate: '2025-07-08' },
  { name: 'Clifford Ward', email: 'Cicero.Lang@hotmail.com', role: 'admin', status: 'inactive', department: 'Design', joinDate: '2024-08-19' },
  { name: 'Darrin Medhurst', email: 'Carl_Stoltenberg-Schowalter55@gmail.com', role: 'editor', status: 'inactive', department: 'Design', joinDate: '2025-05-11' },
  { name: 'Demetrius Gutkowski', email: 'Angel48@gmail.com', role: 'admin', status: 'pending', department: 'HR', joinDate: '2023-11-27' },
  { name: 'Deshaun Kub-Schoen', email: 'Leann.Farrell@gmail.com', role: 'viewer', status: 'pending', department: 'Marketing', joinDate: '2023-11-26' },
  { name: 'Dominick Tremblay', email: 'Kristin.Hodkiewicz32@hotmail.com', role: 'admin', status: 'active', department: 'Finance', joinDate: '2024-12-20' },
  { name: 'Donna Farrell', email: 'Jalyn.Leannon@hotmail.com', role: 'editor', status: 'inactive', department: 'Support', joinDate: '2024-10-16' },
  { name: 'Dr. Bernita Koelpin', email: 'Angelina29@yahoo.com', role: 'viewer', status: 'pending', department: 'Engineering', joinDate: '2026-01-29' },
  { name: 'Dr. Brent Kling', email: 'Jarrod89@gmail.com', role: 'viewer', status: 'active', department: 'Support', joinDate: '2024-07-03' },
  { name: 'Dr. Rozella Howe', email: 'Keyon51@hotmail.com', role: 'viewer', status: 'pending', department: 'Support', joinDate: '2024-04-08' },
  { name: 'Dr. Werner Hand', email: 'Rocky.Dach@gmail.com', role: 'viewer', status: 'inactive', department: 'Design', joinDate: '2026-01-20' },
  { name: 'Edgar Fadel Jr.', email: 'Juliet_Lueilwitz@yahoo.com', role: 'viewer', status: 'inactive', department: 'Support', joinDate: '2024-12-10' },
  { name: 'Eulah Reinger PhD', email: 'Clarence.Altenwerth66@yahoo.com', role: 'admin', status: 'inactive', department: 'Support', joinDate: '2025-02-22' },
  { name: 'Faith Douglas', email: 'Ines94@yahoo.com', role: 'editor', status: 'inactive', department: 'Finance', joinDate: '2024-11-25' },
  { name: 'Gilberto Koch', email: 'Susana9@yahoo.com', role: 'admin', status: 'active', department: 'HR', joinDate: '2023-04-06' },
  { name: 'Hortense Hodkiewicz Jr.', email: 'Mamie66@yahoo.com', role: 'viewer', status: 'pending', department: 'Support', joinDate: '2024-02-01' },
  { name: 'Jacinto Connelly', email: 'Gerardo2@gmail.com', role: 'editor', status: 'active', department: 'Finance', joinDate: '2023-07-16' },
  { name: 'Jeff Swift DDS', email: 'Davon.Grant23@hotmail.com', role: 'admin', status: 'pending', department: 'Marketing', joinDate: '2024-05-05' },
  { name: 'Jessie Nitzsche', email: 'Armando5@hotmail.com', role: 'viewer', status: 'active', department: 'Engineering', joinDate: '2023-07-22' },
  { name: 'Joelle Grant', email: 'Lyle54@yahoo.com', role: 'editor', status: 'inactive', department: 'Finance', joinDate: '2023-07-02' },
  { name: 'Jonas Waters', email: 'Francisco_Kunde99@gmail.com', role: 'admin', status: 'inactive', department: 'Marketing', joinDate: '2024-06-03' },
  { name: 'Kane Haley', email: 'Kathleen_Daniel82@yahoo.com', role: 'admin', status: 'active', department: 'Marketing', joinDate: '2024-07-16' },
  { name: 'Kenny Witting', email: 'Diana11@hotmail.com', role: 'viewer', status: 'active', department: 'Support', joinDate: '2024-10-27' },
  { name: 'Kiera Kirlin', email: 'Pauline.Kunde@gmail.com', role: 'viewer', status: 'inactive', department: 'Engineering', joinDate: '2023-08-15' },
  { name: 'Linda Mraz', email: 'Lana_Vandervort-Reichert86@hotmail.com', role: 'viewer', status: 'active', department: 'HR', joinDate: '2024-01-07' },
  { name: 'Loren Schimmel', email: 'Aniya67@hotmail.com', role: 'admin', status: 'pending', department: 'Sales', joinDate: '2023-06-04' },
  { name: 'Louvenia Kozey', email: 'Ole.Keebler10@yahoo.com', role: 'editor', status: 'active', department: 'Sales', joinDate: '2025-11-29' },
  { name: 'Mafalda Luettgen', email: 'Mable.Bins@gmail.com', role: 'viewer', status: 'pending', department: 'HR', joinDate: '2024-06-19' },
  { name: 'Mafalda Stanton', email: 'Tyree56@hotmail.com', role: 'admin', status: 'pending', department: 'Marketing', joinDate: '2025-12-18' },
  { name: 'Mallory Volkman', email: 'Clay.Mitchell38@hotmail.com', role: 'editor', status: 'pending', department: 'Marketing', joinDate: '2024-11-21' },
  { name: 'Mr. Jesse O\'Reilly', email: 'Erma39@yahoo.com', role: 'editor', status: 'active', department: 'Support', joinDate: '2025-07-27' },
  { name: 'Mr. Leland Wisozk', email: 'Sheila94@hotmail.com', role: 'admin', status: 'inactive', department: 'Engineering', joinDate: '2026-01-19' },
  { name: 'Ms. Destini Swaniawski', email: 'Bernice_Kertzmann76@hotmail.com', role: 'editor', status: 'active', department: 'HR', joinDate: '2025-02-28' },
  { name: 'Shawn Schumm', email: 'Nicole54@hotmail.com', role: 'editor', status: 'active', department: 'Finance', joinDate: '2025-01-27' },
  { name: 'Stacy Bogan', email: 'Helga.Heaney@gmail.com', role: 'admin', status: 'inactive', department: 'Marketing', joinDate: '2024-11-05' },
  { name: 'Tobin Ullrich', email: 'Wilfred.OConner@hotmail.com', role: 'editor', status: 'inactive', department: 'Support', joinDate: '2023-05-29' },
  { name: 'Traci Schowalter-Haag', email: 'Kathleen_Gerlach@yahoo.com', role: 'editor', status: 'active', department: 'Finance', joinDate: '2025-07-07' },
  { name: 'Tracey McGlynn', email: 'Tony_Walker@hotmail.com', role: 'editor', status: 'inactive', department: 'HR', joinDate: '2025-12-28' },
  { name: 'Tyrone Kemmer III', email: 'Wanda.Fay@hotmail.com', role: 'editor', status: 'pending', department: 'Sales', joinDate: '2026-02-03' },
  { name: 'Vickie O\'Reilly', email: 'Jacinthe33@yahoo.com', role: 'editor', status: 'active', department: 'Support', joinDate: '2025-04-23' },
];
