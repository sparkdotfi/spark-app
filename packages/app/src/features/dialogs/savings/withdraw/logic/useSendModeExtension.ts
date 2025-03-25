import { useBlockExplorerAddressLink } from '@/domain/hooks/useBlockExplorerAddressLink'
import { useIsSmartContract } from '@/domain/hooks/useIsSmartContract'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { UseFormReturn, useForm } from 'react-hook-form'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { Mode, ReceiverFormSchema, SendModeExtension } from '../types'
import { getReceiverFormValidator } from './validation'

export interface UseSendModeOptionsParams {
  mode: Mode
  tokenRepository: TokenRepository
}

export function useSendModeExtension({
  mode,
  tokenRepository,
}: UseSendModeOptionsParams): SendModeExtension | undefined {
  const { receiver, receiverForm, isFormValid } = useReceiverFormValues(tokenRepository)
  const blockExplorerAddressLink = useBlockExplorerAddressLink({ address: receiver })
  const { isSmartContract, isPending: isSmartContractCheckPending } = useIsSmartContract(receiver)

  return mode === 'send'
    ? {
        receiverForm,
        receiver,
        blockExplorerAddressLink: isFormValid ? blockExplorerAddressLink : undefined,
        showReceiverIsSmartContractWarning: Boolean(isFormValid && !isSmartContractCheckPending && isSmartContract),
        enableActions: isFormValid && !isSmartContractCheckPending,
      }
    : undefined
}

interface UseDebouncedReceiverFormValuesResult {
  receiverForm: UseFormReturn<ReceiverFormSchema>
  receiver: CheckedAddress | undefined
  isFormValid: boolean
}

function useReceiverFormValues(tokenRepository: TokenRepository): UseDebouncedReceiverFormValuesResult {
  const { address: account } = useAccount()

  const receiverForm = useForm<ReceiverFormSchema>({
    resolver: zodResolver(
      getReceiverFormValidator({ account, tokenAddresses: tokenRepository.all().map((r) => r.token.address) }),
    ),
    defaultValues: { receiver: '' },
    mode: 'onChange',
  })

  const rawReceiver = receiverForm.watch('receiver')
  const isFormValid = !receiverForm.formState.isValidating && receiverForm.formState.isValid
  const receiver = isFormValid ? CheckedAddress(rawReceiver as Address) : undefined

  return {
    receiverForm,
    receiver,
    isFormValid,
  }
}
