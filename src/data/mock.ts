import { faker } from '@faker-js/faker';

faker.seed(42);

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  department: string;
  joinDate: string;
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Support', 'HR', 'Finance'];

export function generateUsers(count: number): User[] {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(['admin', 'editor', 'viewer'] as const),
    status: faker.helpers.arrayElement(['active', 'inactive', 'pending'] as const),
    department: faker.helpers.arrayElement(departments),
    joinDate: faker.date.past({ years: 3 }).toISOString().split('T')[0],
    avatar: faker.image.avatar(),
  }));
}

export function generateTasks(count: number): Task[] {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    title: faker.hacker.phrase(),
    description: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(['todo', 'in-progress', 'review', 'done'] as const),
    priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical'] as const),
    assignee: faker.person.fullName(),
  }));
}

export function generateNotifications(count: number): Notification[] {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    message: faker.lorem.sentence(),
    type: faker.helpers.arrayElement(['info', 'success', 'warning', 'error'] as const),
    timestamp: faker.date.recent({ days: 7 }).toISOString(),
    read: faker.datatype.boolean(),
  }));
}

export const mockUsers = generateUsers(50);
export const mockTasks = generateTasks(24);
export const mockNotifications = generateNotifications(10);

export const searchableItems = [
  ...mockUsers.map(u => ({ type: 'user' as const, id: u.id, label: u.name, sub: u.email })),
  ...departments.map(d => ({ type: 'department' as const, id: d, label: d, sub: `${mockUsers.filter(u => u.department === d).length} members` })),
];
