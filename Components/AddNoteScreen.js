// Components/AddNoteScreen.js
// Screen for creating notes with ImagePicker and DatePicker

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Platform,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Image Picker
let launchImageLibrary, launchCamera;
try {
  const imagePicker = require('react-native-image-picker');
  launchImageLibrary = imagePicker.launchImageLibrary;
  launchCamera = imagePicker.launchCamera;
} catch (e) {
  console.log('react-native-image-picker not found');
}

// Date Picker
let DateTimePicker;
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (e) {
  console.log('@react-native-community/datetimepicker not found');
}

const BG = require('../assets/bg.webp');
const BACK_ICON = require('../assets/back.webp');

const NOTES_KEY = '@lugano_notes_v1';

export default function AddNoteScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const editingNote = route?.params?.note || null;
  const isEditing = !!editingNote;

  const [noteTitle, setNoteTitle] = useState(editingNote?.title || '');
  const [noteText, setNoteText] = useState(editingNote?.text || '');
  const [noteDate, setNoteDate] = useState(editingNote?.date ? new Date(editingNote.date) : new Date());
  const [noteImage, setNoteImage] = useState(editingNote?.image || null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const pickImage = () => {
    if (!launchImageLibrary || !launchCamera) {
      Alert.alert(
        'Image Picker',
        'react-native-image-picker library is not installed.\n\nInstall: npm install react-native-image-picker\n\nThen run: cd ios && pod install (for iOS)',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera', 
          onPress: () => {
            launchCamera(
              { mediaType: 'photo', quality: 0.8 },
              (response) => {
                if (response.didCancel) return;
                if (response.errorMessage) {
                  Alert.alert('Error', response.errorMessage);
                  return;
                }
                if (response.assets && response.assets[0]) {
                  setNoteImage(response.assets[0].uri);
                }
              }
            );
          }
        },
        { 
          text: 'Gallery', 
          onPress: () => {
            launchImageLibrary(
              { mediaType: 'photo', quality: 0.8 },
              (response) => {
                if (response.didCancel) return;
                if (response.errorMessage) {
                  Alert.alert('Error', response.errorMessage);
                  return;
                }
                if (response.assets && response.assets[0]) {
                  setNoteImage(response.assets[0].uri);
                }
              }
            );
          }
        },
        {
          text: 'Remove Image',
          onPress: () => setNoteImage(null),
          style: noteImage ? 'default' : 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const saveNote = async () => {
    if (!noteTitle.trim() && !noteText.trim()) {
      Alert.alert('Error', 'Please enter a title or text for the note');
      return;
    }

    try {
      const notes = await AsyncStorage.getItem(NOTES_KEY);
      const notesArray = notes ? JSON.parse(notes) : [];
      
      if (isEditing && editingNote?.id) {
        // Обновляем существующую заметку
        const noteIndex = notesArray.findIndex(n => n.id === editingNote.id);
        if (noteIndex !== -1) {
          notesArray[noteIndex] = {
            ...editingNote,
            title: noteTitle.trim() || 'Untitled Note',
            text: noteText.trim(),
            date: noteDate.toISOString(),
            image: noteImage,
            updatedAt: new Date().toISOString(),
          };
        }
      } else {
        // Создаем новую заметку
        const newNote = {
          id: Date.now().toString(),
          title: noteTitle.trim() || 'Untitled Note',
          text: noteText.trim(),
          date: noteDate.toISOString(),
          image: noteImage,
          createdAt: new Date().toISOString(),
        };
        notesArray.push(newNote);
      }
      
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notesArray));
      setShowSuccessModal(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={BG}
        style={styles.bg}
        resizeMode="cover"
        blurRadius={Platform.OS === 'ios' ? 14 : 10}
      >
        <View style={styles.dim} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
              style={styles.backBtn}
            >
              <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
            </TouchableOpacity>

            <Text style={styles.headerTitle} numberOfLines={1}>
              {isEditing ? 'Edit Note' : 'Create Note'}
            </Text>

            <View style={{ width: 38 }} />
          </View>

          {/* Note Card */}
          <View style={styles.cardWrap}>
            <View style={styles.cardBorder}>
              <LinearGradient
                colors={['rgba(255, 107, 53, 0.80)', 'rgba(204, 85, 0, 0.90)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.00)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gloss}
                pointerEvents="none"
              />

              <View style={styles.cardContent}>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Title"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                />

                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    Date: {formatDate(noteDate)}
                  </Text>
                </TouchableOpacity>

                {/* Date Picker Modal */}
                <Modal
                  visible={showDatePicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <View style={styles.datePickerModalOverlay}>
                    <View style={styles.datePickerModalContent}>
                      <LinearGradient
                        colors={['rgba(255, 107, 53, 0.95)', 'rgba(204, 85, 0, 0.95)']}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <LinearGradient
                        colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.00)']}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.gloss}
                        pointerEvents="none"
                      />

                      <View style={styles.datePickerModalInner}>
                        <Text style={styles.datePickerModalTitle}>Select Date</Text>
                        
                        {DateTimePicker ? (
                          // Используем нативный DatePicker если библиотека установлена
                          <View style={styles.nativeDatePickerContainer}>
                            {Platform.OS === 'ios' ? (
                              <DateTimePicker
                                value={noteDate}
                                mode="date"
                                display="spinner"
                                onChange={(event, selectedDate) => {
                                  if (selectedDate) {
                                    setNoteDate(selectedDate);
                                  }
                                }}
                                style={styles.nativeDatePicker}
                                textColor="#FFFFFF"
                                themeVariant="dark"
                                accentColor="#FF6B35"
                              />
                            ) : (
                              <DateTimePicker
                                value={noteDate}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                  setShowDatePicker(false);
                                  if (selectedDate) {
                                    setNoteDate(selectedDate);
                                  }
                                }}
                                textColor="#FFFFFF"
                                accentColor="#FF6B35"
                              />
                            )}
                            {Platform.OS === 'ios' && (
                              <View style={styles.datePickerModalActions}>
                                <TouchableOpacity
                                  style={styles.datePickerCancelButton}
                                  onPress={() => setShowDatePicker(false)}
                                >
                                  <Text style={styles.datePickerCancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.datePickerDoneButton}
                                  onPress={() => setShowDatePicker(false)}
                                >
                                  <Text style={styles.datePickerDoneButtonText}>Done</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        ) : (
                          // Fallback: ручной ввод даты
                          <>
                            <View style={styles.dateInputContainer}>
                              <View style={styles.dateInputRow}>
                                <Text style={styles.dateInputLabel}>Year:</Text>
                                <TextInput
                                  style={styles.dateInput}
                                  value={noteDate.getFullYear().toString()}
                                  keyboardType="numeric"
                                  onChangeText={(text) => {
                                    const year = parseInt(text) || noteDate.getFullYear();
                                    const newDate = new Date(noteDate);
                                    newDate.setFullYear(year);
                                    setNoteDate(newDate);
                                  }}
                                />
                              </View>

                              <View style={styles.dateInputRow}>
                                <Text style={styles.dateInputLabel}>Month:</Text>
                                <TextInput
                                  style={styles.dateInput}
                                  value={(noteDate.getMonth() + 1).toString()}
                                  keyboardType="numeric"
                                  onChangeText={(text) => {
                                    const month = parseInt(text) || (noteDate.getMonth() + 1);
                                    const newDate = new Date(noteDate);
                                    newDate.setMonth(Math.max(1, Math.min(12, month)) - 1);
                                    setNoteDate(newDate);
                                  }}
                                />
                              </View>

                              <View style={styles.dateInputRow}>
                                <Text style={styles.dateInputLabel}>Day:</Text>
                                <TextInput
                                  style={styles.dateInput}
                                  value={noteDate.getDate().toString()}
                                  keyboardType="numeric"
                                  onChangeText={(text) => {
                                    const day = parseInt(text) || noteDate.getDate();
                                    const newDate = new Date(noteDate);
                                    newDate.setDate(Math.max(1, Math.min(31, day)));
                                    setNoteDate(newDate);
                                  }}
                                />
                              </View>
                            </View>

                            <View style={styles.datePickerModalActions}>
                              <TouchableOpacity
                                style={styles.datePickerCancelButton}
                                onPress={() => setShowDatePicker(false)}
                              >
                                <Text style={styles.datePickerCancelButtonText}>Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.datePickerDoneButton}
                                onPress={() => setShowDatePicker(false)}
                              >
                                <Text style={styles.datePickerDoneButtonText}>Done</Text>
                              </TouchableOpacity>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </Modal>

                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                  <Text style={styles.imageButtonText}>
                    {noteImage ? 'Change Image' : 'Add Image'}
                  </Text>
                </TouchableOpacity>

                {noteImage && (
                  <Image source={{ uri: noteImage }} style={styles.noteImagePreview} />
                )}

                <TextInput
                  style={[styles.noteInput, styles.noteTextInput]}
                  placeholder="Write your note here..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={closeSuccessModal}
        >
          <View style={styles.successModalOverlay}>
            <View style={styles.successModalContent}>
              <LinearGradient
                colors={['rgba(255, 107, 53, 0.95)', 'rgba(204, 85, 0, 0.95)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.00)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gloss}
                pointerEvents="none"
              />

              <View style={styles.successModalInner}>
                <Text style={styles.successModalTitle}>
                  {isEditing ? 'Note Updated!' : 'Note Saved!'}
                </Text>
                <Text style={styles.successModalText}>
                  {isEditing 
                    ? 'Your note has been updated successfully.'
                    : 'Your note has been saved successfully.'}
                </Text>
                <Text style={styles.successModalLocation}>
                  You can find it in the{' '}
                  <Text style={styles.successModalLocationBold}>Saved</Text> tab, under{' '}
                  <Text style={styles.successModalLocationBold}>Notes</Text> section.
                </Text>
                <TouchableOpacity
                  style={styles.successModalButton}
                  onPress={closeSuccessModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.successModalButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },

  scrollContent: {
    paddingHorizontal: 16,
  },

  header: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  backBtn: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 38,
    height: 38,
    tintColor: '#fff',
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: 22, fontWeight: '900' },

  cardWrap: {
    alignItems: 'center',
    width: '100%',
  },

  cardBorder: {
    width: '100%',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(215,197,138,0.55)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 18,
    overflow: 'hidden',
    minHeight: 500,
  },

  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
  },

  gloss: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 50,
  },

  noteInput: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },

  noteTextInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  dateButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },

  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  datePickerModalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(215,197,138,0.55)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },

  datePickerModalInner: {
    padding: 24,
  },

  datePickerModalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
  },

  nativeDatePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  nativeDatePicker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : 'auto',
  },

  dateInputContainer: {
    gap: 16,
    marginBottom: 24,
  },

  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateInputLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },

  dateInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginLeft: 12,
  },

  datePickerModalActions: {
    flexDirection: 'row',
    gap: 12,
  },

  datePickerCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.20)',
  },

  datePickerCancelButtonText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '800',
  },

  datePickerDoneButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.30)',
  },

  datePickerDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  imageButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
  },

  imageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  noteImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: 'cover',
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },

  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.20)',
  },

  cancelButtonText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '800',
  },

  saveButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.30)',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  // Success Modal
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(215,197,138,0.55)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  successModalInner: {
    padding: 28,
    alignItems: 'center',
  },
  successModalTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  successModalText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  successModalLocation: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  successModalLocationBold: {
    fontWeight: '900',
    color: '#FFFFFF',
  },
  successModalButton: {
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.30)',
    minWidth: 120,
  },
  successModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
