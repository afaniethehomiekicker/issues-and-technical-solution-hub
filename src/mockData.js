export const INITIAL_ISSUES = [
  {
    id: 'issue-1024',
    title: 'GORM Preload not loading nested relationship',
    description: 'Customer data is returned empty when preloading invoice relationships.',
    category: 'Backend',
    tags: ['Go', 'Gin', 'GORM'],
    priority: 'High',
    status: 'Open',
    author: 'Ahmed Khan',
    createdAt: new Date().toISOString()
  },
  {
    id: 'issue-1025',
    title: 'React infinite re-render loop on dashboard',
    description: 'useEffect missing dependency array causing state update loop.',
    category: 'Frontend',
    tags: ['React', 'JavaScript'],
    priority: 'Medium',
    status: 'In Discussion',
    author: 'Hassan',
    createdAt: new Date().toISOString()
  }
];