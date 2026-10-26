import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
export function useLayoutWidth() { const [width, setWidth] = useState(375); useEffect(() => { const update = () => setWidth(Math.max(1, Dimensions.get('window').width || 375)); update(); const subscription = Dimensions.addEventListener('change', update); return () => subscription.remove(); }, []); return width; }
