import TopBar from '@/components/TopBar';

export default function TopBarExample() {
  return (
    <TopBar 
      notificationCount={1}
      onNotificationClick={() => console.log('Notifications clicked')}
      onProfileClick={() => console.log('Profile clicked')}
    />
  );
}
