"use client"

/* Libraries imports */
import { Badge, ButtonGroup, Flex, Heading, HStack, IconButton, Text } from '@chakra-ui/react'
import React, { useState, useMemo, useCallback } from 'react'
import { HiOutlineEye, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import { MdOutlineFilterList, MdDescription } from 'react-icons/md'
import { LuSearch } from 'react-icons/lu'
import { GoDotFill } from 'react-icons/go'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { lighten } from 'polished'

/* Plan management module imports */
import { Plan } from '@plan-management/types'
import { PLAN_MODULE_NAME, PLAN_PAGE_ROUTES } from '@plan-management/constants'
import { PlanTableSkeleton } from '@plan-management/components'
import { usePlanOperations } from '@plan-management/hooks'

/* Shared module imports */
import { ConfirmationDialog, EmptyStateContainer, TextInputField, TableFilterSelect } from '@shared/components'
import { usePermissions } from '@shared/contexts'
import { CURRENCY_SYMBOL, ERROR_RED_COLOR, GRAY_COLOR, PRIMARY_COLOR, SUCCESS_GREEN_COLOR, SUCCESS_GREEN_COLOR2 } from '@shared/config'
import { PERMISSION_ACTIONS } from '@/lib/shared/constants/rbac'

/* Plan table component props */
interface PlanTableProps {
  plans: Plan[]
  lastUpdated: string
  onRefresh?: () => void
  loading?: boolean
}

/* Delete confirmation dialog state */
interface DeleteConfirmState {
  show: boolean
  planId?: number
  planName?: string
}


/* Plan table component with CRUD operations */
const PlanTable: React.FC<PlanTableProps> = ({ 
  plans, 
  lastUpdated, 
  onRefresh, 
  loading = false 
}) => {
  /* Navigation and translation hooks */
  const router = useRouter()
  const t = useTranslations('PlanManagement.table')

  /* Permission checking for action buttons */
  const { hasSpecificPermission } = usePermissions()

  /* Plan operations hook */
  const { deletePlan, isDeleting } = usePlanOperations()

  /* Table interaction state */
  const [selectedPlanID, setSelectedPlanID] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ show: false })
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  /* Filter dropdown options */
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

  /* Filter plans by search term and dropdowns */
  const filteredPlans = useMemo(() => {
    if (loading) return []

    return plans.filter(plan => {
      const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && Boolean(plan.is_active) === true) ||
        (statusFilter === 'inactive' && Boolean(plan.is_active) === false)
      const matchesType = typeFilter === 'all' ||
        (typeFilter === 'custom' && Boolean(plan.is_custom) === true) ||
        (typeFilter === 'regular' && Boolean(plan.is_custom) === false)

      return matchesSearch && matchesStatus && matchesType
    })
  }, [plans, searchTerm, statusFilter, typeFilter, loading])

  /* Row selection handler */
  const handlePlanRowClick = useCallback((planID: number) => {
    setSelectedPlanID(prev => prev === planID ? null : planID)
  }, [])

  /* Navigation handlers for action buttons */
  const handleViewPlan = useCallback((planId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(PLAN_PAGE_ROUTES.VIEW.replace(':id', planId.toString()))
  }, [router])

  const handleEditPlan = useCallback((planId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(PLAN_PAGE_ROUTES.EDIT.replace(':id', planId.toString()))
  }, [router])

  /* Show delete confirmation dialog */
  const handleDeletePlan = useCallback((planId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    const plan = plans.find(p => p.id === planId)
    setDeleteConfirm({
      show: true,
      planId,
      planName: plan?.name || t('emptyState.noPlansFound')
    })
  }, [plans, t])

  /* Execute plan deletion */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm.planId) return

    const success = await deletePlan(deleteConfirm.planId, deleteConfirm.planName)

    if (success) {
      onRefresh?.()
    }

    setDeleteConfirm({ show: false })
  }, [deleteConfirm.planId, deleteConfirm.planName, deletePlan, onRefresh])

  /* Cancel deletion dialog */
  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm({ show: false })
  }, [])

  return (
    <Flex p={5} flexDir="column" w="100%" gap={3}>
      <Flex justify="space-between">
        <Heading color={lighten(0.2, GRAY_COLOR)}>{t('title')}</Heading>
        <Text alignSelf="end" fontSize="xs">{t('lastUpdated')}: {lastUpdated}</Text>
      </Flex>

      <Flex gap={6} p={5} flexDir="column" borderWidth={1} borderColor={lighten(0.3, GRAY_COLOR)} borderRadius={10}>
        <HStack w="100%" gap={3}>
          <Flex w="70%">
            <TextInputField
              label=""
              value={searchTerm}
              placeholder={t('search.placeholder')}
              isInValid={false}
              required={false}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
              leftIcon={<LuSearch />}
              inputProps={{
                h: "36px",
                borderRadius: "2xl"
              }}
            />
          </Flex>

          <Flex w="30%" gap={3}>
            <TableFilterSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={statusOptions}
              placeholder={t('filters.status.placeholder')}
              disabled={loading}
              icon={<MdOutlineFilterList size={16} color={lighten(0.2, GRAY_COLOR)} />}
            />

            <TableFilterSelect
              value={typeFilter}
              onValueChange={setTypeFilter}
              options={typeOptions}
              placeholder={t('filters.type.placeholder')}
              disabled={loading}
              icon={<MdOutlineFilterList size={16} color={lighten(0.2, GRAY_COLOR)} />}
            />
          </Flex>
        </HStack>

        <Flex w="100%" flexDir="column" gap={2}>
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
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <PlanTableSkeleton key={`skeleton-${index}`} />
            ))
          ) : filteredPlans.length === 0 ? (
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
                <Text w="10%" textAlign="center">{index + 1}</Text>
                <Text w="30%">{plan.name}</Text>
                <Text w="20%" fontSize="xs">
                  <Text fontSize="md" as="b">
                    {CURRENCY_SYMBOL}{Number(plan.monthly_price).toFixed(2)}
                  </Text>
                  {t('pricing.perMonth')}
                </Text>
                <Text w="20%">
                  <Badge
                    fontWeight="bold"
                    color={Boolean(plan.is_active) === true ? SUCCESS_GREEN_COLOR2 : ERROR_RED_COLOR}
                    borderRadius={20}
                    py={1}
                    px={2}
                    borderWidth={2}
                    borderColor={Boolean(plan.is_active) === true
                      ? lighten(0.35, SUCCESS_GREEN_COLOR)
                      : lighten(0.3, ERROR_RED_COLOR)
                    }
                    bg={Boolean(plan.is_active) === true
                      ? lighten(0.45, SUCCESS_GREEN_COLOR)
                      : lighten(0.35, ERROR_RED_COLOR)
                    }
                  >
                    <GoDotFill />
                    {Boolean(plan.is_active) === true ? t('status.active') : t('status.inactive')}
                  </Badge>
                </Text>
                <ButtonGroup w="20%" justifyContent={'center'}>
                  {hasSpecificPermission(PLAN_MODULE_NAME, PERMISSION_ACTIONS.READ) && (
                    <IconButton
                      bg="none"
                      color="black"
                      _hover={{ color: PRIMARY_COLOR }}
                      onClick={(e) => handleViewPlan(plan.id, e)}
                      title={t('actions.view')}
                    >
                      <HiOutlineEye />
                    </IconButton>
                  )}
                  {hasSpecificPermission(PLAN_MODULE_NAME, PERMISSION_ACTIONS.UPDATE) && (
                    <IconButton
                      bg="none"
                      color="black"
                      _hover={{ color: PRIMARY_COLOR }}
                      onClick={(e) => handleEditPlan(plan.id, e)}
                      title={t('actions.edit')}
                    >
                      <HiOutlinePencilAlt />
                    </IconButton>
                  )}
                  {hasSpecificPermission(PLAN_MODULE_NAME, PERMISSION_ACTIONS.DELETE) && (
                    <IconButton
                      bg="none"
                      color="black"
                      _hover={{ color: ERROR_RED_COLOR }}
                      onClick={(e) => handleDeletePlan(plan.id, e)}
                      title={t('actions.delete')}
                      disabled={isDeleting}
                      loading={isDeleting}
                    >
                      <HiOutlineTrash />
                    </IconButton>
                  )}
                </ButtonGroup>
              </HStack>
            ))
          )}
        </Flex>
      </Flex>

      <ConfirmationDialog
        isOpen={deleteConfirm.show}
        title={t('deleteDialog.title')}
        message={t('deleteDialog.message', { planName: deleteConfirm.planName || 'Selected Plan' })}
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