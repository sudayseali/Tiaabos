import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
  Dimensions,
  useWindowDimensions,
  Animated,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

import xisnulData from './xisnul.json';

// Disable splash screen auto-hide
SplashScreen.preventAutoHideAsync();

export default function App() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isSmallScreen = width < 375;
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDua, setSelectedDua] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(xisnulData);
  const [favorites, setFavorites] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  
  // Xajmiga Farta (Font Size State)
  const [arabicSize, setArabicSize] = useState(isSmallScreen ? 22 : 26);
  const [somaliSize, setSomaliSize] = useState(isSmallScreen ? 14 : 16);
  
  // Card scale animation
  const scaleAnim = new Animated.Value(1);

  // 1. Loading Screen Effect
  useEffect(() => {
    const loadApp = async () => {
      try {
        // Load saved preferences here if needed
        await new Promise(resolve => setTimeout(resolve, 1500));
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }
    };
    
    loadApp();
  }, []);

  // 2. Search Logic with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.trim() === '') {
        setFilteredData(xisnulData);
      } else {
        const lowerText = searchText.toLowerCase();
        const newData = xisnulData.filter(item => 
          item.title.toLowerCase().includes(lowerText) || 
          item.somali.toLowerCase().includes(lowerText) ||
          (item.arabic && item.arabic.toLowerCase().includes(lowerText))
        );
        setFilteredData(newData);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  // Calculate responsive font sizes
  const responsiveFonts = useMemo(() => {
    const baseArabic = isSmallScreen ? 22 : 26;
    const baseSomali = isSmallScreen ? 14 : 16;
    const scaleFactor = Math.min(width / 375, 1.2); // Scale based on screen width
    
    return {
      arabic: baseArabic * scaleFactor,
      somali: baseSomali * scaleFactor,
      title: (isSmallScreen ? 24 : 28) * scaleFactor,
      cardTitle: (isSmallScreen ? 15 : 16) * scaleFactor,
    };
  }, [width, isSmallScreen]);

  // Functions-ka bedelka Farta
  const increaseFont = () => {
    if (arabicSize < (isSmallScreen ? 40 : 50)) {
      setArabicSize(prev => prev + (isSmallScreen ? 1.5 : 2));
      setSomaliSize(prev => prev + (isSmallScreen ? 1 : 1.5));
    }
  };

  const decreaseFont = () => {
    if (arabicSize > (isSmallScreen ? 16 : 18)) {
      setArabicSize(prev => prev - (isSmallScreen ? 1.5 : 2));
      setSomaliSize(prev => prev - (isSmallScreen ? 1 : 1.5));
    }
  };

  const resetFont = () => {
    setArabicSize(isSmallScreen ? 22 : 26);
    setSomaliSize(isSmallScreen ? 14 : 16);
  };

  const handleCardPress = (item) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedDua(item);
      // Add to recently viewed
      setRecentlyViewed(prev => {
        const newList = prev.filter(id => id !== item.id);
        return [item.id, ...newList.slice(0, 9)];
      });
    });
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleBookmark = (id) => {
    setBookmarks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Render item for FlatList
  const renderItem = ({ item, index }) => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={[
          styles.card, 
          isLandscape && styles.cardLandscape,
          { marginBottom: isSmallScreen ? 8 : 12 }
        ]} 
        onPress={() => handleCardPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.idBadge, { backgroundColor: item.categoryColor || '#00695c' }]}>
              <Text style={styles.idText}>{item.id}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                style={styles.actionButton}
              >
                <Ionicons 
                  name={favorites[item.id] ? "heart" : "heart-outline"} 
                  size={20} 
                  color={favorites[item.id] ? "#e91e63" : "#ccc"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  toggleBookmark(item.id);
                }}
                style={styles.actionButton}
              >
                <Ionicons 
                  name={bookmarks[item.id] ? "bookmark" : "bookmark-outline"} 
                  size={20} 
                  color={bookmarks[item.id] ? "#ff9800" : "#ccc"} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={[
            styles.cardTitle,
            { fontSize: responsiveFonts.cardTitle }
          ]} numberOfLines={2}>
            {item.title}
          </Text>
          
          <Text style={[
            styles.cardPreview,
            { fontSize: responsiveFonts.somali * 0.9 }
          ]} numberOfLines={2}>
            {item.somali}
          </Text>
          
          {item.category && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#00695c" />
      </TouchableOpacity>
    </Animated.View>
  );

  // --- RENDERING ---

  // A. Loading View
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#00695c" />
        <View style={[
          styles.logoCircle,
          { width: width * 0.3, height: width * 0.3 }
        ]}>
          <Ionicons name="book" size={width * 0.1} color="#00695c" />
        </View>
        <Text style={[
          styles.loadingTitle,
          { fontSize: responsiveFonts.title }
        ]}>
          Xisnul Muslim
        </Text>
        <ActivityIndicator size="large" color="#00695c" style={{ marginTop: 20 }} />
        <Text style={styles.loadingText}>Diyaar u noqo...</Text>
      </View>
    );
  }

  // B. Detail View (Full Screen)
  if (selectedDua) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#00695c" />
        
        {/* Detail Header */}
        <View style={[styles.header, isLandscape && styles.headerLandscape]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => setSelectedDua(null)} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={[
              styles.headerTitle,
              { maxWidth: width * 0.6 }
            ]} numberOfLines={1}>
              {selectedDua.title}
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.fontControls}>
              <TouchableOpacity onPress={decreaseFont} style={styles.fontBtn}>
                <Text style={styles.fontBtnText}>A-</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={resetFont} style={styles.resetFontBtn}>
                <Text style={styles.resetFontBtnText}>A</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={increaseFont} style={styles.fontBtn}>
                <Text style={styles.fontBtnText}>A+</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.detailActions}>
              <TouchableOpacity 
                onPress={() => toggleFavorite(selectedDua.id)}
                style={styles.detailActionBtn}
              >
                <Ionicons 
                  name={favorites[selectedDua.id] ? "heart" : "heart-outline"} 
                  size={22} 
                  color="#fff" 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => toggleBookmark(selectedDua.id)}
                style={styles.detailActionBtn}
              >
                <Ionicons 
                  name={bookmarks[selectedDua.id] ? "bookmark" : "bookmark-outline"} 
                  size={22} 
                  color="#fff" 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Detail Content */}
        <ScrollView 
          contentContainerStyle={[
            styles.detailContent,
            isLandscape && styles.detailContentLandscape
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[
            styles.detailCard,
            { padding: isSmallScreen ? 16 : 24 }
          ]}>
            {/* Arabic Text with Tajweed (if available) */}
            <View style={styles.arabicContainer}>
              <Text style={[
                styles.arabicText, 
                { 
                  fontSize: arabicSize,
                  lineHeight: arabicSize * 1.8,
                  textAlign: 'right',
                  writingDirection: 'rtl'
                }
              ]}>
                {selectedDua.arabic}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            {/* Translation */}
            <View style={styles.translationContainer}>
              <View style={styles.labelContainer}>
                <Ionicons name="language" size={16} color="#00695c" />
                <Text style={styles.label}>MACNAHA:</Text>
              </View>
              <Text style={[
                styles.somaliText, 
                { 
                  fontSize: somaliSize,
                  lineHeight: somaliSize * 1.6
                }
              ]}>
                {selectedDua.somali}
              </Text>
            </View>
            
            {/* Additional Info if available */}
            {(selectedDua.source || selectedDua.context) && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoContainer}>
                  {selectedDua.source && (
                    <View style={styles.infoItem}>
                      <Ionicons name="library" size={14} color="#666" />
                      <Text style={styles.infoText}>Laga soo qaatay: {selectedDua.source}</Text>
                    </View>
                  )}
                  {selectedDua.context && (
                    <View style={styles.infoItem}>
                      <Ionicons name="information-circle" size={14} color="#666" />
                      <Text style={styles.infoText}>Goobta: {selectedDua.context}</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
          
          {/* Navigation between Duas */}
          <View style={styles.navButtons}>
            {selectedDua.id > 1 && (
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => {
                  const prevDua = xisnulData.find(d => d.id === selectedDua.id - 1);
                  setSelectedDua(prevDua);
                }}
              >
                <Ionicons name="chevron-back" size={20} color="#00695c" />
                <Text style={styles.navButtonText}>Hore</Text>
              </TouchableOpacity>
            )}
            
            {selectedDua.id < xisnulData.length && (
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]}
                onPress={() => {
                  const nextDua = xisnulData.find(d => d.id === selectedDua.id + 1);
                  setSelectedDua(nextDua);
                }}
              >
                <Text style={styles.navButtonText}>Xigta</Text>
                <Ionicons name="chevron-forward" size={20} color="#00695c" />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // C. List View (Main Screen)
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#00695c" />
          
          {/* Main Header */}
          <View style={[
            styles.mainHeader,
            { paddingHorizontal: isSmallScreen ? 16 : 20 }
          ]}>
            <View style={styles.titleContainer}>
              <Text style={[
                styles.mainTitle,
                { fontSize: responsiveFonts.title }
              ]}>
                📖 Xisnul Muslim
              </Text>
              <Text style={styles.subTitle}>
                {xisnulData.length} Duco oo la xulay
              </Text>
            </View>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#fff" style={styles.searchIcon} />
              <TextInput 
                style={[
                  styles.searchInput,
                  { fontSize: isSmallScreen ? 14 : 16 }
                ]}
                placeholder="Raadi duco..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={searchText}
                onChangeText={setSearchText}
                clearButtonMode="while-editing"
              />
              {searchText.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setSearchText('')}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="time" size={14} color="#b2dfdb" />
                <Text style={styles.statText}>{recentlyViewed.length} La eegay</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={14} color="#b2dfdb" />
                <Text style={styles.statText}>
                  {Object.values(favorites).filter(Boolean).length} Jecel
                </Text>
              </View>
            </View>
          </View>

          {/* List */}
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[
              styles.listContent,
              isLandscape && styles.listContentLandscape
            ]}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-off" size={60} color="#ccc" />
                <Text style={styles.emptyText}>Wax duco ah lagama helin '{searchText}'</Text>
                <TouchableOpacity 
                  onPress={() => setSearchText('')}
                  style={styles.emptyButton}
                >
                  <Text style={styles.emptyButtonText}>Daawo dhammaan ducada</Text>
                </TouchableOpacity>
              </View>
            }
            ListHeaderComponent={
              filteredData.length > 0 && (
                <View style={styles.listHeader}>
                  <Text style={styles.listHeaderText}>
                    {filteredData.length} Duco oo la helay
                  </Text>
                </View>
              )
            }
            key={isLandscape ? 'landscape' : 'portrait'}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// --- STYLES ---
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoCircle: {
    borderRadius: width * 0.15,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingTitle: {
    fontWeight: 'bold',
    color: '#00695c',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },

  // Main Header Styles
  mainHeader: {
    backgroundColor: '#00695c',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  titleContainer: {
    marginBottom: 15,
  },
  mainTitle: {
    fontWeight: 'bold',
    color: '#fff',
  },
  subTitle: {
    color: '#b2dfdb',
    fontSize: 14,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: isSmallScreen ? 10 : 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#b2dfdb',
    fontSize: 12,
    marginLeft: 5,
  },

  // List Styles
  listContent: {
    padding: isSmallScreen ? 12 : 16,
    paddingBottom: 100,
  },
  listContentLandscape: {
    paddingHorizontal: width * 0.1,
  },
  listHeader: {
    marginBottom: 15,
  },
  listHeaderText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardLandscape: {
    marginHorizontal: 4,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  idBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  cardTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardPreview: {
    color: '#666',
    marginBottom: 8,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  categoryText: {
    color: '#2e7d32',
    fontSize: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.2,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#00695c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Detail View Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00695c',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 15,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  headerLandscape: {
    paddingHorizontal: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 4,
    marginRight: 12,
  },
  fontBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fontBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetFontBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  resetFontBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailActions: {
    flexDirection: 'row',
  },
  detailActionBtn: {
    padding: 8,
    marginLeft: 8,
  },
  detailContent: {
    padding: 16,
    flexGrow: 1,
  },
  detailContentLandscape: {
    paddingHorizontal: width * 0.1,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  arabicContainer: {
    marginBottom: 20,
  },
  arabicText: {
    color: '#1a237e',
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro' : 'sans-serif',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  translationContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#00695c',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  somaliText: {
    color: '#37474f',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#666',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  nextButton: {
    flexDirection: 'row-reverse',
  },
  navButtonText: {
    color: '#00695c',
    fontWeight: '600',
    marginHorizontal: 8,
  },
});