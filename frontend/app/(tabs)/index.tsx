import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from './dashboard';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={Dashboard} />
    </Tab.Navigator>
  );
}