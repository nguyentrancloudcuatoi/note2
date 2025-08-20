import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNotes } from '../context/NotesContext';

export default function NoteDetailScreen() {
  const params = useLocalSearchParams<{ id: string; title?: string; body?: string }>();
  const navigation = useNavigation();
  const { removeNote, updateNote } = useNotes();

  const { id, title, body } = params;
  const numericId = id ? Number(id) : NaN;
  const [editTitle, setEditTitle] = useState<string>(title ?? '');
  const [editBody, setEditBody] = useState<string>(body ?? '');

  const headerTitle = useMemo(() => (title ? title : `Ghi chú #${id}`), [title, id]);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: headerTitle });
  }, [navigation, headerTitle]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>ID:</Text>
      <Text style={styles.value}>{id}</Text>

      <Text style={[styles.label, styles.mt16]}>Tiêu đề:</Text>
      <TextInput
        value={editTitle}
        onChangeText={setEditTitle}
        placeholder="Nhập tiêu đề"
        style={styles.input}
      />

      <Text style={[styles.label, styles.mt16]}>Nội dung:</Text>
      <TextInput
        value={editBody}
        onChangeText={setEditBody}
        placeholder="Nhập nội dung"
        style={[styles.input, styles.multiline]}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      <View style={styles.mt24}>
        <Button title="Lưu" onPress={() => { if (!isNaN(numericId)) { updateNote(numericId, { title: editTitle, body: editBody }); navigation.goBack(); } }} />
      </View>
      <View style={styles.mt16}>
        <Button title="Xóa ghi chú" color="#b00020" onPress={() => { if (id) { removeNote(Number(id)); navigation.goBack(); } }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  value: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multiline: {
    minHeight: 140,
  },
  mt16: {
    marginTop: 16,
  },
  mt24: {
    marginTop: 24,
  },
});


