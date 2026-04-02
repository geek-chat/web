import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../theme';

type Props = {
  uri?: string;
  name: string;
  size?: number;
};

export default function Avatar({ uri, name, size = 44 }: Props) {
  const initial = name.charAt(0).toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        accessible={false}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      accessible={false}
    >
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.bg.tertiary,
  },
  fallback: {
    backgroundColor: colors.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});
