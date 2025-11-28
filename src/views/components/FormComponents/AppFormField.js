import React from 'react';
import {useFormikContext} from 'formik';
import AppTextInput from '../AppTextInput';
import { StyleSheet,Platform ,View} from 'react-native'; 
import ErrorMessage from './ErrorMessage';
import colors from '../../../constants/colors';
import AppText from '../AppText';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const isAndroid = Platform.OS === 'android';

function AppFormField({
  login = false,
  name,
  width,
  color = 'white',
  height,
  borderRadius = 10,
  shadowOffset = {width: 0.5, height: 0.5},
  shadowColor = colors.gray,
  paddingHorizontal,
  iconPosition = 'center',
  fontSize,
  shadowOpacity = 1,
  elevation = 5,
  padding = 15,
  borderColor,
  borderWidth,
  backgroundColor = colors.secondary,
  title,
  isRequired=false,
  maxLength,
  ...otherProps
}) {
  const {setFieldTouched, setFieldValue, errors, touched, values} =
    useFormikContext();
  return (
    <View>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>

      {title && <AppText style={styles.headingText}>{title} {isRequired && <AppText style={{color:colors.red}}>*</AppText>}</AppText>}
      {maxLength && <AppText style={styles.maxLength}>(Max length {maxLength})</AppText>}
    </View>

      <TextInput
        
        iconPosition={iconPosition}
        onBlur={() => setFieldTouched(name)}
        onChangeText={text => setFieldValue(name, text)}
        value={values[name]}
        width={width}
        height={height}
        borderRadius={borderRadius}
        shadowOffset={shadowOffset}
        shadowColor={shadowColor}
        shadowOpacity={shadowOpacity}
        elevation={elevation}
        padding={padding}
        backgroundColor={backgroundColor}
        borderWidth={borderWidth}
        borderColor={borderColor}
        fontSize={fontSize}
        paddingHorizontal={paddingHorizontal}
        textAreaWidth={width}
        maxLength={maxLength}
        {...otherProps}
        />
      <ErrorMessage error={errors[name]} visible={touched[name]} />
  
    </View>
  );
}

const styles = StyleSheet.create({
 
  headingText: {
    color: colors.black,
    fontWeight: '600',
   // marginVertical: hp('.5%'),
  },
  maxLength:{
color:colors.mediumGray,
fontSize:14,
alignSelf:'center'
}
  
});

export default AppFormField;
