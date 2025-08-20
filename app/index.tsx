import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNotes } from './context/NotesContext';

type Note = {
  id: number;
  title: string;
  body?: string;
  isLocal?: boolean;
};

export default function NotesListScreen() {
  const router = useRouter();

  const { notes, loading, error, addNote, refreshFromApi } = useNotes();
  const [inputTitle, setInputTitle] = useState<string>('');

  useEffect(() => {
    refreshFromApi();
  }, [refreshFromApi]);

  const handleAddNote = useCallback(() => {
    const trimmed = inputTitle.trim();
    if (!trimmed) return;
    addNote(trimmed);
    setInputTitle('');
  }, [inputTitle, addNote]);

  const handlePressNote = useCallback(
    (note: Note) => {
      router.push({
        pathname: '/note/[id]',
        params: { id: String(note.id), title: note.title, body: note.body ?? '' },
      });
    },
    [router]
  );

  const listEmptyComponent = useMemo(() => {
    if (loading) return null;
    if (error) return null;
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Chưa có ghi chú. Hãy thêm một ghi chú mới!</Text>
      </View>
    );
  }, [loading, error]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ghi chú cá nhân</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={inputTitle}
          onChangeText={setInputTitle}
          placeholder="Nhập tiêu đề ghi chú"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleAddNote}
        />
        <View style={styles.addButton}>
          <Button title="Thêm" onPress={handleAddNote} />
        </View>
      </View>

      {loading && (
        <View style={styles.centerRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      )}
      {!!error && (
        <View style={styles.centerRow}>
          <Text style={styles.errorText}>Lỗi: {error}</Text>
        </View>
      )}

      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable onPress={() => handlePressNote(item)} style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
            <Text numberOfLines={1} style={styles.itemTitle}>
              {item.title}
            </Text>
            {item.isLocal ? <Text style={styles.badge}>Mới</Text> : null}
          </Pressable>
        )}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={listEmptyComponent}
        contentContainerStyle={notes.length === 0 ? styles.listEmptyPadding : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addButton: {
    width: 80,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  loadingText: {
    marginLeft: 8,
  },
  errorText: {
    color: '#d00',
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f6f6f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPressed: {
    backgroundColor: '#ececec',
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
  },
  badge: {
    marginLeft: 12,
    fontSize: 12,
    color: '#555',
  },
  separator: {
    height: 8,
  },
  emptyWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  listEmptyPadding: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
});


