import {useDispatch, useSelector} from 'react-redux';

const useAppDispatch = () => useDispatch();
const useAppSelector = useSelector;

export {useAppDispatch, useAppSelector};
export default {useAppDispatch, useAppSelector};

