import { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen, AppHeader, PageHeading } from '@/components/layout/Screen';
import { Button, Chip } from '@/components/ui/Controls';
import { ReleaseCard } from '@/components/feature/ReleaseCard';
import { useReleases } from '@/hooks/useReleases';
import { colors, fonts, radius, spacing } from '@/constants/theme';

export function ReleaseLibrary() {
  const { releases } = useReleases();
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'title'>('newest');

  const items = useMemo(() => {
    const filtered = releases.filter(
      (item) =>
        (filter === 'All' || item.status === filter) &&
        `${item.title} ${item.artist}`.toLowerCase().includes(search.toLowerCase())
    );
    return [...filtered].sort((a, b) =>
      sort === 'title'
        ? a.title.localeCompare(b.title)
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [releases, filter, search, sort]);

  return (
    <Screen>
      <AppHeader />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <PageHeading
                eyebrow="Library"
                title="Release management"
                subtitle="Track status, metadata, packaging, and performance from one workspace."
              />
              <Button label="Upload" onPress={() => router.push('/upload')} icon="plus" />
            </View>

            <View style={styles.toolbar}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search releases"
                placeholderTextColor={colors.subtle}
                style={styles.search}
              />
            </View>

            <View style={styles.filters}>
              {['All', 'Live', 'In review', 'Draft'].map((option) => (
                <Chip
                  key={option}
                  label={option}
                  selected={filter === option}
                  onPress={() => setFilter(option)}
                />
              ))}
            </View>

            <View style={styles.summaryRow}>
              <SummaryPill label="Live" value={String(releases.filter((item) => item.status === 'Live').length)} />
              <SummaryPill label="Drafts" value={String(releases.filter((item) => item.status === 'Draft').length)} />
              <SummaryPill label="Queued" value={String(releases.filter((item) => item.status === 'In review').length)} />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ReleaseCard
            release={item}
            onPress={() => router.push({ pathname: '/release/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={32} color={colors.subtle} />
            <Text style={styles.emptyTitle}>
              {releases.length === 0 ? 'No releases yet' : 'No matching releases'}
            </Text>
            <Text style={styles.emptyBody}>
              {releases.length === 0
                ? 'Upload your first single, EP or album to start building your catalog.'
                : 'Try a different search term or status filter.'}
            </Text>
            {releases.length === 0 ? (
              <Button label="Upload a release" icon="plus" onPress={() => router.push('/upload')} />
            ) : (
              <Button
                label="Clear filters"
                secondary
                onPress={() => {
                  setFilter('All');
                  setSearch('');
                }}
              />
            )}
          </View>
        }
      />
    </Screen>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryPill}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  toolbar: {
    marginBottom: spacing.md,
  },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fonts.body,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryPill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  summaryLabel: {
    color: colors.subtle,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryValue: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 22,
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fonts.section,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyBody: {
    color: colors.subtle,
    fontSize: fonts.label,
    lineHeight: 22,
    textAlign: 'center',
  },
});
