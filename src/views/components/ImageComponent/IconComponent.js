import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../../constants/colors';
import  FontAwesome  from 'react-native-vector-icons/FontAwesome5';

const Icon = ({
  name,
  color = colors.primary,
  size = 24,
  style,
  onPress,
   type='ionicons',
  pressed = false, // 👈 default false now
  ...props
}) => {
  return   <TouchableOpacity onPress={onPress}>

  { type === 'fontAwesome' ? (
    <FontAwesome name={name} size={size} color={color} {...props} />
  ) : (
    <Ionicons name={name} size={size} color={color} {...props} />
  )}
  </TouchableOpacity>
};


export default Icon;
