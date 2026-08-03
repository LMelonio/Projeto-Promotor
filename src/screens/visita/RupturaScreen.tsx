import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';

import {
  useActiveVisit,
  useAssignedProducts,
  useClientRupturas,
  useRegisterRuptura,
} from './useVisitaData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Product } from '@/models/Product';
import type { RupturaStatus } from '@/models/Ruptura';
import type { VisitaStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

const RUPTURA_STATUS_LABEL: Record<RupturaStatus, string> = {
  pending: 'Pendente',
  resolved: 'Resolvida',
};

/**
 * Registro de Ruptura (wireframe "Ruptura", Fase 3): falta de produto no
 * cliente da visita em andamento. Produto restrito à carteira do promotor
 * (`CarteiraProdutos`) — mesma regra de negócio da Carteira de Clientes.
 */
export function RupturaScreen() {
  const navigation = useNavigation<NavigationProp<VisitaStackParamList>>();
  const promoterId = useAuthStore((s) => s.promoter?.id);
  const activeVisit = useActiveVisit(promoterId);
  const clientId = activeVisit.data?.clientId;

  const products = useAssignedProducts(promoterId);
  const rupturas = useClientRupturas(clientId);
  const registerRuptura = useRegisterRuptura(clientId);

  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');

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

  async function handleSubmit() {
    const quantityMissing = Number(quantity);
    if (
      !clientId ||
      !selectedProduct ||
      !Number.isFinite(quantityMissing) ||
      quantityMissing <= 0
    ) {
      return;
    }

    await registerRuptura.mutateAsync({
      clientId,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      supplier: selectedProduct.supplier,
      quantityMissing,
    });

    setSelectedProduct(null);
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

  const canSubmit = selectedProduct !== null && Number(quantity) > 0;

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
          <View className="flex-row items-center gap-2 h-12 px-4 rounded-input border border-line bg-surface-card mb-3">
            <Feather name="search" size={18} color={colors.inkMuted} />
            <TextInput
              className="flex-1 text-[15px] text-ink"
              placeholder="Buscar produto por nome ou código"
              placeholderTextColor={colors.inkMuted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {filteredProducts.length > 0 ? (
            <Card className="gap-0.5 mb-4">
              {filteredProducts.slice(0, 20).map((product, index) => (
                <Pressable
                  key={product.id}
                  onPress={() => setSelectedProduct(product)}
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
                  {item.quantityMissing} unid. em falta ·{' '}
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
    </ScreenContainer>
  );
}
