import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';

import { ActivityCameraModal } from './components/ActivityCameraModal';
import { EanScannerModal } from './components/EanScannerModal';
import {
  useActivities,
  useActiveVisit,
  useAssignedProducts,
  useClientRupturas,
  useRegisterActivity,
  useRegisterRuptura,
} from './useVisitaData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Product } from '@/models/Product';
import { RUPTURA_SEVERITY_LABEL, type RupturaSeverity, type RupturaStatus } from '@/models/Ruptura';
import type { VisitaStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

const RUPTURA_STATUS_LABEL: Record<RupturaStatus, string> = {
  pending: 'Pendente',
  resolved: 'Resolvida',
};

const SEVERITIES: RupturaSeverity[] = ['stockout', 'low_stock'];

/**
 * Registro de Ruptura (wireframe "9-Registro de ruptura", Documentação
 * Funcional): falta de produto no cliente da visita em andamento. Produto
 * restrito à carteira do promotor (`CarteiraProdutos`) — mesma regra de
 * negócio da Carteira de Clientes. Leitura de EAN, severidade e foto
 * obrigatória adicionadas a partir da documentação real (ver
 * `docs/DECISIONS.md`, item 21).
 */
export function RupturaScreen() {
  const navigation = useNavigation<NavigationProp<VisitaStackParamList>>();
  const promoterId = useAuthStore((s) => s.promoter?.id);
  const activeVisit = useActiveVisit(promoterId);
  const clientId = activeVisit.data?.clientId;

  const products = useAssignedProducts(promoterId);
  const rupturas = useClientRupturas(clientId);
  const registerRuptura = useRegisterRuptura(clientId);
  const activities = useActivities(activeVisit.data?.visitId);
  const registerActivity = useRegisterActivity(activeVisit.data?.visitId);
  const hasRupturaActivity = (activities.data ?? []).some((a) => a.kind === 'ruptura');

  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [severity, setSeverity] = useState<RupturaSeverity | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanNotFound, setScanNotFound] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<'synced' | 'queued' | null>(null);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term.length === 0) return [];
    return (products.data ?? []).filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.internalCode.toLowerCase().includes(term) ||
        product.eanCode.includes(term),
    );
  }, [products.data, search]);

  function selectProduct(product: Product) {
    setSelectedProduct(product);
    setSeverity(null);
    setPhotoUri(null);
    setScanNotFound(false);
  }

  function handleEanScanned(ean: string) {
    setScannerOpen(false);
    const found = (products.data ?? []).find((p) => p.eanCode === ean);
    if (found) {
      selectProduct(found);
    } else {
      setScanNotFound(true);
    }
  }

  function handlePhotoConfirmed(uris: string[]) {
    setCameraOpen(false);
    if (uris[0]) setPhotoUri(uris[0]);
  }

  async function handleSubmit() {
    const quantityMissing = Number(quantity);
    if (
      !clientId ||
      !selectedProduct ||
      !severity ||
      !photoUri ||
      !Number.isFinite(quantityMissing) ||
      quantityMissing <= 0
    ) {
      return;
    }

    const outcome = await registerRuptura.mutateAsync({
      clientId,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      supplier: selectedProduct.supplier,
      severity,
      quantityMissing,
      photoCount: 1,
      reportedAt: new Date().toISOString(),
    });

    if (!hasRupturaActivity && promoterId && activeVisit.data) {
      await registerActivity.mutateAsync({
        clientId,
        promoterId,
        kind: 'ruptura',
        photoCount: 1,
      });
    }

    setLastOutcome(outcome.synced ? 'synced' : 'queued');
    setSelectedProduct(null);
    setSeverity(null);
    setPhotoUri(null);
    setQuantity('');
    setSearch('');
  }

  if (activeVisit.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState message="Carregando..." />
      </ScreenContainer>
    );
  }

  if (!activeVisit.data || !clientId) {
    return (
      <ScreenContainer>
        <ErrorState message="Nenhuma visita em andamento." onRetry={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  const canSubmit =
    selectedProduct !== null && severity !== null && photoUri !== null && Number(quantity) > 0;

  return (
    <ScreenContainer scroll>
      <View className="flex-row items-center gap-3 mt-4 mb-5">
        <Feather
          name="chevron-left"
          size={24}
          color={colors.ink}
          onPress={() => navigation.goBack()}
        />
        <Text className="text-ink font-extrabold text-xl flex-1">Registrar ruptura</Text>
      </View>

      {lastOutcome ? (
        <View className="flex-row items-center gap-2 mb-4">
          <Feather
            name={lastOutcome === 'synced' ? 'check-circle' : 'clock'}
            size={16}
            color={lastOutcome === 'synced' ? colors.success : colors.warning}
          />
          <Text className="text-ink-muted text-xs flex-1">
            {lastOutcome === 'synced'
              ? 'Ruptura registrada com sucesso.'
              : 'Ruptura registrada — será sincronizada quando a conexão voltar.'}
          </Text>
        </View>
      ) : null}

      {selectedProduct ? (
        <Card className="gap-3 mb-4">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1">
              <Text className="text-ink text-sm font-semibold" numberOfLines={2}>
                {selectedProduct.name}
              </Text>
              <Text className="text-ink-muted text-xs mt-0.5">
                {selectedProduct.supplier} · {selectedProduct.internalCode}
              </Text>
            </View>
            <Pressable onPress={() => setSelectedProduct(null)}>
              <Feather name="x" size={18} color={colors.inkMuted} />
            </Pressable>
          </View>

          <View>
            <Text className="text-ink-muted text-xs mb-1">Gravidade</Text>
            <View className="flex-row gap-2">
              {SEVERITIES.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSeverity(s)}
                  className={`flex-1 h-11 rounded-input border items-center justify-center ${
                    severity === s ? 'bg-brand border-brand' : 'border-line bg-surface-bg'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${severity === s ? 'text-white' : 'text-ink'}`}
                  >
                    {RUPTURA_SEVERITY_LABEL[s]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-ink-muted text-xs mb-1">Quantidade em falta</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder="0"
              placeholderTextColor={colors.inkMuted}
              keyboardType="number-pad"
              className="h-12 px-4 rounded-input border border-line bg-surface-bg text-ink text-[15px]"
            />
          </View>

          <View>
            <Text className="text-ink-muted text-xs mb-1">Foto obrigatória</Text>
            {photoUri ? (
              <Pressable onPress={() => setCameraOpen(true)}>
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: 88, height: 88, borderRadius: 12 }}
                  contentFit="cover"
                />
              </Pressable>
            ) : (
              <Button
                label="Tirar foto"
                variant="ghost"
                icon={<Feather name="camera" size={16} color={colors.ink} />}
                onPress={() => setCameraOpen(true)}
              />
            )}
          </View>

          {registerRuptura.isError ? (
            <Text className="text-danger text-xs">
              Não foi possível registrar a ruptura agora. Tente novamente.
            </Text>
          ) : null}

          <Button
            label="Registrar ruptura"
            disabled={!canSubmit}
            loading={registerRuptura.isPending}
            onPress={handleSubmit}
          />
        </Card>
      ) : (
        <>
          <View className="flex-row items-center gap-2 mb-3">
            <View className="flex-1 flex-row items-center gap-2 h-12 px-4 rounded-input border border-line bg-surface-card">
              <Feather name="search" size={18} color={colors.inkMuted} />
              <TextInput
                className="flex-1 text-[15px] text-ink"
                placeholder="Buscar produto por nome ou código"
                placeholderTextColor={colors.inkMuted}
                value={search}
                onChangeText={(text) => {
                  setSearch(text);
                  setLastOutcome(null);
                  setScanNotFound(false);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Pressable
              onPress={() => setScannerOpen(true)}
              className="w-12 h-12 rounded-input border border-line bg-surface-card items-center justify-center"
              accessibilityLabel="Ler código EAN"
            >
              <Feather name="maximize" size={18} color={colors.ink} />
            </Pressable>
          </View>

          {scanNotFound ? (
            <Text className="text-danger text-xs mb-3">
              Nenhum produto da sua carteira tem esse código EAN.
            </Text>
          ) : null}

          {filteredProducts.length > 0 ? (
            <Card className="gap-0.5 mb-4">
              {filteredProducts.slice(0, 20).map((product, index) => (
                <Pressable
                  key={product.id}
                  onPress={() => selectProduct(product)}
                  className={`py-3 ${
                    index < Math.min(filteredProducts.length, 20) - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <Text className="text-ink text-sm" numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text className="text-ink-muted text-xs mt-0.5">
                    {product.supplier} · {product.internalCode}
                  </Text>
                </Pressable>
              ))}
            </Card>
          ) : search.trim().length > 0 ? (
            <Text className="text-ink-muted text-sm py-4 text-center mb-4">
              Nenhum produto encontrado na sua carteira.
            </Text>
          ) : null}
        </>
      )}

      <Text className="text-ink font-bold text-base mb-2">Rupturas deste cliente</Text>
      {rupturas.isLoading ? (
        <LoadingState />
      ) : (rupturas.data ?? []).length === 0 ? (
        <Text className="text-ink-muted text-sm py-4 text-center">
          Nenhuma ruptura registrada para este cliente.
        </Text>
      ) : (
        <FlatList
          data={rupturas.data}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <Card className="flex-row items-center justify-between gap-2">
              <View className="flex-1">
                <Text className="text-ink text-sm" numberOfLines={1}>
                  {item.productName}
                </Text>
                <Text className="text-ink-muted text-xs mt-0.5">
                  {item.quantityMissing} unid. · {RUPTURA_SEVERITY_LABEL[item.severity]} ·{' '}
                  {item.photoCount} foto(s) ·{' '}
                  {new Date(item.reportedAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <Badge
                label={RUPTURA_STATUS_LABEL[item.status]}
                tone={item.status === 'resolved' ? 'success' : 'warning'}
              />
            </Card>
          )}
        />
      )}

      <ActivityCameraModal
        visible={cameraOpen}
        activityLabel="Foto da ruptura"
        minPhotos={1}
        onCancel={() => setCameraOpen(false)}
        onConfirm={handlePhotoConfirmed}
      />

      <EanScannerModal
        visible={scannerOpen}
        onCancel={() => setScannerOpen(false)}
        onScanned={handleEanScanned}
      />
    </ScreenContainer>
  );
}
