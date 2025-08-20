"use client"

import { 
  Badge, ButtonGroup, Flex, Heading, HStack, IconButton, Text, Input, Select, 
  Portal, createListCollection, InputGroup, Skeleton, SkeletonCircle 
} from '@chakra-ui/react'
import React, { useState, useMemo, useCallback } from 'react'
import { HiOutlineEye, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import { MdOutlineFilterList, MdDescription } from 'react-icons/md'
import { LuSearch } from 'react-icons/lu'
import { GoDotFill } from 'react-icons/go'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { lighten } from 'polished'
import { Plan } from '@plan-management/types/plans'
import { planService } from '@plan-management/api'
import { toaster } from '@/components/ui/toaster'
import { ConfirmationDialog, EmptyStateContainer } from '@shared/components'
import { 
  CURRENCY_SYMBOL, ERROR_RED_COLOR, GRAY_COLOR, PRIMARY_COLOR, 
  SUCCESS_GREEN_COLOR, SUCCESS_GREEN_COLOR2, LOADING_DELAY, LOADING_DELAY_ENABLED 
} from '@shared/config'

/* Component prop interfaces */
interface PlanTableProps {
  plans: Plan[]
  lastUpdated: string
  onPlanDeleted?: () => void
  loading?: boolean
}

interface DeleteConfirmState {
  show: boolean
  planId?: number
  planName?: string
}

/* Filter option constants - to be generated dynamically with translations */

/* Loading skeleton row component */
const SkeletonRow: React.FC = () => (
  <HStack 
    w="100%" 
    borderLeftRadius={20} 
    borderRightRadius={20}
    borderWidth={1} 
    borderColor={lighten(0.3, GRAY_COLOR)} 
    p={2}
  >
    <Flex w="10%" justifyContent="center">
      <Skeleton height="20px" width="20px" />
    </Flex>
    <Flex w="30%">
      <Skeleton height="20px" width="80%" />
    </Flex>
    <Flex w="20%">
      <Skeleton height="20px" width="60%" />
    </Flex>
    <Flex w="20%">
      <Skeleton height="28px" width="70px" borderRadius="20px" />
    </Flex>
    <Flex w="20%" justify="center" gap={2}>
      <SkeletonCircle size="8" />
      <SkeletonCircle size="8" />
      <SkeletonCircle size="8" />
    </Flex>
  </HStack>
)

/* Toast notification helper */
const createToastMessage = (type: 'success' | 'error', title: string, description: string) => ({
  type,
  title,
  description,
  duration: type === 'error' ? 7000 : 5000,
  closable: true,
})

/* Plan table component with CRUD operations */
const PlanTable: React.FC<PlanTableProps> = ({ 
  plans, 
  lastUpdated, 
  onPlanDeleted, 
  loading = false 
}) => {
  /* Next.js router for navigation */
  const router = useRouter()
  const t = useTranslations('PlanManagement.table')

  /* State management for table interactions */
  const [selectedPlanID, setSelectedPlanID] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ show: false })
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  /* Dynamic filter options with translations */
  const statusOptions = useMemo(() => [
    { label: t('filters.status.allStatus'), value: 'all' },
    { label: t('filters.status.active'), value: 'active' },
    { label: t('filters.status.inactive'), value: 'inactive' },
  ], [t])

  const typeOptions = useMemo(() => [
    { label: t('filters.type.allTypes'), value: 'all' },
    { label: t('filters.type.regular'), value: 'regular' },
    { label: t('filters.type.custom'), value: 'custom' },
  ], [t])

  /* Chakra UI select collections for filters */
  const statusCollection = useMemo(() => createListCollection({ items: statusOptions }), [statusOptions])
  const typeCollection = useMemo(() => createListCollection({ items: typeOptions }), [typeOptions])

  /* Filtered plans based on search and filters */
  const filteredPlans = useMemo(() => {
    if (loading) return [] /* Skip filtering during data load */
    
    return plans.filter(plan => {
      const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && plan.is_active === 1) ||
        (statusFilter === 'inactive' && plan.is_active === 0)
      const matchesType = typeFilter === 'all' ||
        (typeFilter === 'custom' && plan.is_custom === 1) ||
        (typeFilter === 'regular' && plan.is_custom === 0)
      
      return matchesSearch && matchesStatus && matchesType
    })
  }, [plans, searchTerm, statusFilter, typeFilter, loading])

  /* User interaction event handlers */
  const handlePlanRowClick = useCallback((planID: number) => {
    setSelectedPlanID(prev => prev === planID ? null : planID)
  }, [])

  const handleViewPlan = useCallback((planId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(`/admin/plan-management/view/${planId}`)
  }, [router])

  const handleEditPlan = useCallback((planId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(`/admin/plan-management/edit/${planId}`)
  }, [router])

  const handleDeletePlan = useCallback((planId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    const plan = plans.find(p => p.id === planId)
    setDeleteConfirm({
      show: true,
      planId,
      planName: plan?.name || t('emptyState.noPlansFound')
    })
  }, [plans])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm.planId) return

    setIsDeleting(true)
    try {
      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY));
      }

      const response = await planService.deleteSubscriptionPlan(deleteConfirm.planId)
      
      if (response.data.success) {
        toaster.create(createToastMessage(
          'success',
          t('toasts.deleteSuccess.title'),
          t('toasts.deleteSuccess.description', { planName: deleteConfirm.planName  })
        ))
        onPlanDeleted?.() /* Trigger parent refresh */
      } else {
        toaster.create(createToastMessage(
          'error',
          t('toasts.deleteError.title'),
          response.data.message || t('toasts.deleteError.description')
        ))
      }
    } catch (error: any) {
      console.error('Error deleting plan:', error)
      toaster.create(createToastMessage(
        'error',
        t('toasts.deleteError.title'),
        t('toasts.deleteError.unexpectedError')
      ))
    } finally {
      setIsDeleting(false)
      setDeleteConfirm({ show: false })
    }
  }, [deleteConfirm, onPlanDeleted])

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm({ show: false })
  }, [])


  /* Main table render with search and filters */
  return (
    <Flex p={5} flexDir="column" w="100%" gap={3}>
      {/* Table title and last updated timestamp */}
      <Flex justify="space-between">
        <Heading color={lighten(0.2, GRAY_COLOR)}>{t('title')}</Heading>
        <Text alignSelf="end" fontSize="xs">{t('lastUpdated')}: {lastUpdated}</Text>
      </Flex>

      {/* Container for search, filters, and table */}
      <Flex gap={6} p={5} flexDir="column" borderWidth={1} borderColor={lighten(0.3, GRAY_COLOR)} borderRadius={10}>
        
        {/* Search input and filter dropdowns */}
        <HStack w="100%" gap={3}>
          {/* Plan name search input */}
          <Flex w="75%">
            <InputGroup flex="1" startElementProps={{px:'12px'}} startElement={<LuSearch />}>
              <Input
                w="100%"
                h="36px"
                p="12px"
                borderRadius="2xl"
                borderColor={lighten(0.3, GRAY_COLOR)}
                placeholder={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                _hover={{ borderColor: lighten(0.2, GRAY_COLOR) }}
                _focus={{
                  borderColor: PRIMARY_COLOR,
                  boxShadow: `0 0 0 1px ${PRIMARY_COLOR}`
                }}
              />
            </InputGroup>
          </Flex>

          {/* Status and type filter dropdowns */}
          <Flex w="25%" gap={3}>
            {/* Active/inactive status filter */}
            <Select.Root 
              value={[statusFilter]} 
              onValueChange={(e) => setStatusFilter(e.value[0])}
              size="sm"
              collection={statusCollection}
              disabled={loading}
            >
              <Select.Control>
                <Select.Trigger
                  borderRadius="2xl"
                  borderColor={lighten(0.3, GRAY_COLOR)}
                  _hover={{ borderColor: lighten(0.2, GRAY_COLOR) }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                  pl={3}
                  pr={3}
                >
                  <MdOutlineFilterList size={16} color={lighten(0.2, GRAY_COLOR)} />
                  <Select.ValueText placeholder={t('filters.status.placeholder')} />
                </Select.Trigger>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content 
                    borderRadius="2xl" 
                    p={2} 
                    gap={1}
                    maxH="200px"
                    overflowY="auto"
                  >
                    {statusCollection.items.map((item) => (
                      <Select.Item 
                        key={item.value} 
                        item={item}
                        p={2}
                        borderRadius="lg"
                        _hover={{ bg: lighten(0.4, GRAY_COLOR) }}
                      >
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
            
            {/* Regular/custom plan type filter */}
            <Select.Root 
              value={[typeFilter]} 
              onValueChange={(e) => setTypeFilter(e.value[0])}
              size="sm"
              collection={typeCollection}
              disabled={loading}
            >
              <Select.Control>
                <Select.Trigger
                  borderRadius="2xl"
                  borderColor={lighten(0.3, GRAY_COLOR)}
                  _hover={{ borderColor: lighten(0.2, GRAY_COLOR) }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                  pl={3}
                  pr={3}
                >
                  <MdOutlineFilterList size={16} color={lighten(0.2, GRAY_COLOR)} />
                  <Select.ValueText placeholder={t('filters.type.placeholder')} />
                </Select.Trigger>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content 
                    borderRadius="2xl" 
                    p={2} 
                    gap={1}
                    maxH="200px"
                    overflowY="auto"
                  >
                    {typeCollection.items.map((item) => (
                      <Select.Item 
                        key={item.value} 
                        item={item}
                        p={2}
                        borderRadius="lg"
                        _hover={{ bg: lighten(0.4, GRAY_COLOR) }}
                      >
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Flex>
        </HStack>

        {/* Data table with headers and rows */}
        <Flex w="100%" flexDir="column" gap={2}>
          {/* Column headers with sorting indicators */}
          <HStack 
            w="100%" 
            borderTopWidth={1} 
            borderColor={GRAY_COLOR}
            fontWeight={500} 
            color={lighten(0.2, GRAY_COLOR)} 
            p={2}
          >
            <Text w="10%" textAlign="center">{t('headers.serialNumber')}</Text>
            <Text w="30%" _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>{t('headers.name')}</Text>
            <Text w="20%" _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>{t('headers.price')}</Text>
            <Text w="20%" _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>{t('headers.status')}</Text>
            <Text w="20%" textAlign="center">{t('headers.actions')}</Text>
          </HStack>

          {/* Plan data rows or empty state */}
          {loading ? (
            /* Loading skeleton rows */
            Array.from({ length: 5 }).map((_, index) => (
              <SkeletonRow key={`skeleton-${index}`} />
            ))
          ) : filteredPlans.length === 0 ? (
            /* Empty state when no plans found */
            <EmptyStateContainer
              icon={<MdDescription size={48} color={lighten(0.2, GRAY_COLOR)} />}
              title={t('emptyState.noPlansFound')}
              description={plans.length === 0 
                ? t('emptyState.noPlansCreated')
                : t('emptyState.adjustFilters')
              }
              testId="plans-empty-state"
            />
          ) : (
            /* Plan data rows */
            filteredPlans.map((plan, index) => (
              <HStack 
                key={plan.id}
                w="100%" 
                borderLeftRadius={20} 
                borderRightRadius={20}
                borderWidth={selectedPlanID === plan.id ? 2 : 1} 
                borderColor={selectedPlanID === plan.id ? lighten(0.3, PRIMARY_COLOR) : lighten(0.3, GRAY_COLOR)} 
                bg={selectedPlanID === plan.id ? lighten(0.47, PRIMARY_COLOR) : ''} 
                _hover={{
                  bg: lighten(0.44, PRIMARY_COLOR),
                  borderColor: lighten(0.3, PRIMARY_COLOR)
                }}
                p={2}
                color={GRAY_COLOR}
                onClick={() => handlePlanRowClick(plan.id)}
              >
                {/* Row index number */}
                <Text w="10%" textAlign="center">{index + 1}</Text>
                
                {/* Subscription plan name */}
                <Text w="30%">{plan.name}</Text>
                
                {/* Monthly pricing display */}
                <Text w="20%" fontSize="xs">
                  <Text fontSize="md" as="b">
                    {CURRENCY_SYMBOL}{Number(plan.monthly_price).toFixed(2)}
                  </Text>
                  {t('pricing.perMonth')}
                </Text>
                
                {/* Active/inactive status indicator */}
                <Text w="20%">
                  <Badge 
                    fontWeight="bold" 
                    color={plan.is_active === 1 ? SUCCESS_GREEN_COLOR2 : ERROR_RED_COLOR} 
                    borderRadius={20} 
                    py={1} 
                    px={2} 
                    borderWidth={2}
                    borderColor={plan.is_active === 1 
                      ? lighten(0.35, SUCCESS_GREEN_COLOR) 
                      : lighten(0.3, ERROR_RED_COLOR)
                    }
                    bg={plan.is_active === 1 
                      ? lighten(0.45, SUCCESS_GREEN_COLOR) 
                      : lighten(0.35, ERROR_RED_COLOR)
                    }
                  >
                    <GoDotFill />
                    {plan.is_active === 1 ? t('status.active') : t('status.inactive')}
                  </Badge>  
                </Text>
                
                {/* View, edit, delete action buttons */}
                <ButtonGroup w="20%">
                  <IconButton 
                    bg="none" 
                    color="black"
                    _hover={{ color: PRIMARY_COLOR }}
                    onClick={(e) => handleViewPlan(plan.id, e)}
                    title={t('actions.view')}
                  >
                    <HiOutlineEye />
                  </IconButton>
                  <IconButton 
                    bg="none" 
                    color="black"
                    _hover={{ color: PRIMARY_COLOR }}
                    onClick={(e) => handleEditPlan(plan.id, e)}
                    title={t('actions.edit')}
                  >
                    <HiOutlinePencilAlt />
                  </IconButton>
                  <IconButton 
                    bg="none" 
                    color="black"
                    _hover={{ color: ERROR_RED_COLOR }}
                    onClick={(e) => handleDeletePlan(plan.id, e)}
                    title={t('actions.delete')}
                    disabled={isDeleting}
                    loading={isDeleting && deleteConfirm.planId === plan.id}
                  >
                    <HiOutlineTrash />
                  </IconButton>
                </ButtonGroup>
              </HStack>
            ))
          )}
        </Flex>
      </Flex>

      {/* Confirmation modal for plan deletion */}
      <ConfirmationDialog
        isOpen={deleteConfirm.show}
        title={t('deleteDialog.title')}
        message={t('deleteDialog.message', { planName: deleteConfirm.planName })}
        confirmText={t('deleteDialog.confirmButton')}
        cancelText={t('deleteDialog.cancelButton')}
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Flex>
  )
}

export default PlanTable