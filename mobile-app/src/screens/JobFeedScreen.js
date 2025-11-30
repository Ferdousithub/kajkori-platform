import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Searchbar,
  Chip,
  FAB,
  ActivityIndicator,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import JobCard from '../components/JobCard';
import FilterModal from '../components/FilterModal';
import { fetchJobs } from '../store/slices/jobSlice';
import { colors, spacing, typography } from '../theme';

const JobFeedScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { jobs, loading, error } = useSelector((state) => state.jobs);
  const user = useSelector((state) => state.auth.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    district: '',
    category: '',
    salaryMin: 0,
    salaryMax: 100000,
    jobType: '',
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const loadJobs = useCallback(() => {
    dispatch(fetchJobs({ ...filters, search: searchQuery }));
  }, [filters, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  }, [loadJobs]);

  const handleSearch = () => {
    loadJobs();
  };

  const handleJobPress = (job) => {
    navigation.navigate('JobDetails', { jobId: job.id });
  };

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setFilterVisible(false);
  };

  const renderJobCard = ({ item }) => (
    <JobCard
      job={item}
      onPress={() => handleJobPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.greeting}>
        {getBanglaGreeting()}, {user?.name}!
      </Text>
      <Text style={styles.subGreeting}>
        আজ আপনার জন্য {jobs?.length || 0}টি নতুন কাজ আছে
      </Text>

      <Searchbar
        placeholder="কাজ খুঁজুন..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
        icon="magnify"
      />

      <View style={styles.quickFilters}>
        <Chip
          icon="map-marker"
          selected={!!filters.district}
          onPress={() => setFilterVisible(true)}
          style={styles.chip}
        >
          {filters.district || 'এলাকা'}
        </Chip>
        <Chip
          icon="cash"
          selected={filters.salaryMin > 0}
          onPress={() => setFilterVisible(true)}
          style={styles.chip}
        >
          {filters.salaryMin > 0
            ? `৳${filters.salaryMin}+`
            : 'বেতন'}
        </Chip>
        <Chip
          icon="briefcase"
          selected={!!filters.jobType}
          onPress={() => setFilterVisible(true)}
          style={styles.chip}
        >
          {filters.jobType || 'ধরন'}
        </Chip>
        <TouchableOpacity
          onPress={() => setFilterVisible(true)}
          style={styles.filterButton}
        >
          <Icon name="tune" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="briefcase-search" size={80} color={colors.disabled} />
      <Text style={styles.emptyText}>কোনো কাজ পাওয়া যায়নি</Text>
      <Text style={styles.emptySubtext}>
        ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="tune-variant"
        label="ফিল্টার"
        style={styles.fab}
        onPress={() => setFilterVisible(true)}
        visible={true}
      />

      <FilterModal
        visible={filterVisible}
        filters={filters}
        onClose={() => setFilterVisible(false)}
        onApply={handleFilterApply}
      />
    </View>
  );
};

const getBanglaGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'সুপ্রভাত';
  if (hour < 17) return 'শুভ দুপুর';
  if (hour < 20) return 'শুভ সন্ধ্যা';
  return 'শুভ রাত্রি';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  greeting: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  subGreeting: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  searchBar: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  quickFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  filterButton: {
    padding: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xxl * 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyText: {
    ...typography.h4,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default JobFeedScreen;
