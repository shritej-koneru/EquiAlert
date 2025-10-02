import TopBar from '../TopBar';

export default function TopBarExample() {
  return (
    <TopBar 
      notificationCount={1}
      onNotificationClick={() => console.log('Notifications clicked')}
      onProfileClick={() => console.log('Profile clicked')}
    />
  );
}
