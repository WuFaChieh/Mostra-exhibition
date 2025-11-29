export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  bookmarkedExhibitionIds: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  text: string;
  date: string;
}

export interface Exhibition {
  id: string;
  title: string;
  artist: string;
  dateRange: string;
  description: string;
  imageUrl: string;
  location: string;
  category: string; // New field for categorization
  tags: string[];
  comments: Comment[];
  rating: number; // Average rating
  sourceUrl: string; // URL for the original source
  bookmarksCount: number; // Total number of times bookmarked
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'info' | 'success' | 'alert';
}

export type ViewState = 'home' | 'collections' | 'categories' | 'detail' | 'login' | 'submit' | 'profile';