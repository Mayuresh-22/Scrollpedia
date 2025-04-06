import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from '@/services/supabase';

type RootStackParamList = {
  HomeScreen: { interests: string[] };
  feed: undefined;
};

const interests: string[] = [
  'Artificial Intelligence', 'Space Exploration', 'Ancient Civilizations', 'World Wars',
  'Hollywood & Cinema', 'Music History', 'Olympics & Global Sports', 'Physics & Chemistry',
  'Medical Innovations', 'Environmental Science', 'Global Politics', 'Stock Market & Economy',
  'Philosophy & Ethics', 'Psychology & Neuroscience', 'Modern Literature',
];

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [saveCount, setSaveCount] = useState<number>(0);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const user = (await supabase.auth.getUser()).data.user;
      setUsername(user?.user_metadata?.username || user?.email?.split('@')[0] || "User");
      setEmail(user?.email || "");
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loadCounts = async () => {
        try {
          // Load like count
          const totalLikes = await AsyncStorage.getItem("totalLikes");
          setLikeCount(parseInt(totalLikes || "0", 10));
          
          // Load save count
          const totalSaves = await AsyncStorage.getItem("totalSaves");
          setSaveCount(parseInt(totalSaves || "0", 10));

          // Load and calculate total comment count
          const commentCounts = await AsyncStorage.getItem("commentCounts");
          if (commentCounts) {
            const counts = JSON.parse(commentCounts);
            const totalComments = Object.values(counts).reduce((sum: number, count: number) => sum + count, 0);
            setCommentCount(totalComments);
          }
        } catch (error) {
          console.error("Error loading counts:", error);
        }
      };
      loadCounts();
    }, [])
  );

  const toggleInterest = (topic: string) => {
    if (selectedInterests.includes(topic)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== topic));
    } else {
      setSelectedInterests([...selectedInterests, topic]);
    }
  };

  const handleSetPreference = () => {
    navigation.navigate('HomeScreen', { interests: selectedInterests });
  };

  const navigateToFeed = () => {
    navigation.navigate('feed');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={navigateToFeed}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>User Profile</Text>
      </View>

      <View style={styles.profileImageContainer}>
        <Image source={require('@/assets/images/icon.png')} style={styles.profileImage} />
      </View>

      <Text style={styles.staticText}>{username}</Text>
      <Text style={styles.staticText}>{email}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Ionicons name="heart" size={24} color="white" />
          <Text style={styles.statNumber}>{likeCount}</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="bookmark" size={24} color="white" />
          <Text style={styles.statNumber}>{saveCount}</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="chatbubble" size={24} color="white" />
          <Text style={styles.statNumber}>{commentCount}</Text>
        </View>
      </View>

      <View style={styles.contentBox}>
        <Text style={styles.sectionTitle}>Content Preferences</Text>
        <View style={styles.tagContainer}>
          {interests.map((topic) => (
            <TouchableOpacity
              key={topic}
              style={[styles.tag, selectedInterests.includes(topic) && styles.tagSelected]}
              onPress={() => toggleInterest(topic)}
            >
              <Text style={[styles.tagText, selectedInterests.includes(topic) && styles.tagTextSelected]}>{topic}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSetPreference}>
          <Text style={styles.submitText}>Set Content Preference</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4c0120',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 12
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  profileImageContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'white',
  },
  staticText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 8,
    backgroundColor: '#823f57',
    borderRadius: 10,
    padding: 12,
  },
  statBox: {
    alignItems: 'center',
    width: '30%',
  },
  statNumber: {
    color: 'white',
    fontSize: 18,
    marginTop: 5,
  },
  contentBox: {
    backgroundColor: '#823f57',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    marginVertical: 8,
    alignSelf: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#4B004F',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
    borderWidth: 1,
    borderColor: '#4B004F',
  },
  tagSelected: {
    backgroundColor: '#e91e63',
    borderColor: '#e91e63',
  },
  tagText: {
    color: '#eee',
    fontSize: 12,
  },
  tagTextSelected: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#4c0120',
    padding: 10,
    borderRadius: 20,
    marginVertical: 8,
    width: '90%',
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ProfileScreen;