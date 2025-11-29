import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { fetchProducts, fetchCategories } from '../../database';

type ChatScreenProps = NativeStackScreenProps<HomeStackParamList, 'Chat'>;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatScreen = ({ navigation }: ChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý AI của Cửa Hàng Thời Trang Công Đoàn. Tôi có thể giúp bạn tìm hiểu về sản phẩm, giá cả và các thông tin khác. Bạn cần hỗ trợ gì?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Get context data
      const products = await fetchProducts();
      const categories = await fetchCategories();
      
      let aiResponseText = '';
      
      try {
        // Simple test first
        console.log('Testing API connection...');
        
        const contextMessage = `Bạn là trợ lý AI của Cửa Hàng Thời Trang Công Đoàn. Thông tin cửa hàng:
- Tên: Cửa Hàng Thời Trang Công Đoàn
- Slogan: Chất lượng - Uy tín - Giá tốt
- Danh mục: ${categories.map(c => c.name).join(', ')}
- Sản phẩm: ${products.slice(0, 3).map(p => `${p.name} (${p.price.toLocaleString('vi-VN')}đ)`).join(', ')}

Hãy trả lời câu hỏi sau về cửa hàng: ${userMessage.text}`;
        
        const response = await fetch('http://10.0.2.2:8080/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: contextMessage
          }),
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log('Raw response:', responseText);
        Alert.alert('AI Response', responseText);
        
        // Try to parse as JSON first, if fails use as text
        try {
          const jsonResponse = JSON.parse(responseText);
          aiResponseText = jsonResponse.response || jsonResponse.message || responseText;
        } catch {
          aiResponseText = responseText;
        }
      } catch (apiError) {
        console.log('API Error:', apiError);
        console.log('Error details:', {
          name: (apiError as Error).name,
          message: (apiError as Error).message
        });
        // Fallback responses based on keywords
        const question = userMessage.text.toLowerCase();
        
        if (question.includes('sản phẩm') || question.includes('hàng')) {
          aiResponseText = `Cửa hàng chúng tôi có ${products.length} sản phẩm thuộc các danh mục: ${categories.map(c => c.name).join(', ')}. Một số sản phẩm nổi bật:\n\n${products.slice(0, 3).map(p => `• ${p.name}: ${p.price.toLocaleString('vi-VN')}đ`).join('\n')}`;
        } else if (question.includes('giá') || question.includes('tiền')) {
          aiResponseText = `Giá sản phẩm tại cửa hàng dao động từ ${Math.min(...products.map(p => p.price)).toLocaleString('vi-VN')}đ đến ${Math.max(...products.map(p => p.price)).toLocaleString('vi-VN')}đ. Chúng tôi cam kết giá cả hợp lý và chất lượng tốt nhất.`;
        } else if (question.includes('danh mục') || question.includes('loại')) {
          aiResponseText = `Cửa hàng có ${categories.length} danh mục chính: ${categories.map(c => c.name).join(', ')}. Mỗi danh mục đều có nhiều sản phẩm chất lượng cao.`;
        } else if (question.includes('chào') || question.includes('xin chào') || question.includes('hello')) {
          aiResponseText = '😊 Xin chào! Tôi là trợ lý AI của Cửa Hàng Thời Trang Công Đoàn. Tôi có thể giúp bạn:\n\n• Tìm hiểu sản phẩm\n• Kiểm tra giá cả\n• Xem danh mục sản phẩm\n\nBạn muốn biết thông tin gì?';
        } else {
          aiResponseText = '🤖 Hiện tại tôi không thể kết nối với AI server. Tuy nhiên tôi vẫn có thể giúp bạn:\n\n• Hỏi về "sản phẩm"\n• Hỏi về "giá cả"\n• Hỏi về "danh mục"\n\nVui lòng thử lại!';
        }
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      <Text style={[styles.messageText, item.isUser ? styles.userMessageText : styles.aiMessageText]}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>⬅️</Text>

        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trợ lý AI</Text>
        <View style={styles.backButton} />
      </View>
      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>📤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#00B8CC',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00B8CC',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#00B8CC',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 18,
  },
});

export default ChatScreen;