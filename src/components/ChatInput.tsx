import { useState, useRef } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, Platform } from 'react-native';
import type { TextInput as TextInputType } from 'react-native';
import { colors } from '../theme';

type Props = {
  onSend: (content: string) => void;
};

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInputType>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="메시지를 입력하세요"
        placeholderTextColor={colors.text.placeholder}
        multiline
        numberOfLines={1}
        returnKeyType="send"
        blurOnSubmit={false}
        onKeyPress={(e) => {
          if (
            Platform.OS === 'web' &&
            e.nativeEvent.key === 'Enter' &&
            !(e.nativeEvent as unknown as KeyboardEvent).shiftKey
          ) {
            e.preventDefault();
            handleSend();
          }
        }}
        accessibilityLabel="메시지 입력"
      />
      <Pressable
        style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim()}
        accessibilityRole="button"
        accessibilityLabel="메시지 전송"
      >
        <Text style={styles.sendText}>전송</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg.input,
    color: colors.text.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    marginRight: 8,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: colors.bubble.mineText,
    fontSize: 15,
    fontWeight: '600',
  },
});
