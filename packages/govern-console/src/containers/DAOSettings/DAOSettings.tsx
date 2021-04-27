/* eslint-disable */
import React, { useState, memo, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ANWrappedPaper } from 'components/WrapperPaper/ANWrapperPaper';
import backButtonIcon from '../../images/back-btn.svg';
import { useTheme, styled } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { InputField } from '../../components/InputFields/InputField';
import TextArea from 'components/TextArea/TextArea';
import { ANButton } from 'components/Button/ANButton';
// import Modal from '@material-ui/core/Modal';
import { SimpleModal } from '../../components/Modal/SimpleModal';
import { ANCircularProgressWithCaption } from '../../components/CircularProgress/ANCircularProgressWithCaption';
import { CiruclarProgressStatus } from '../../components/CircularProgress/ANCircularProgress';
import { GET_DAO_BY_NAME } from '../DAO/queries';
import { useQuery } from '@apollo/client';
import { buildPayload } from '../../utils/ERC3000'
import { useWallet } from '../../EthersWallet';
import { erc20ApprovalTransaction } from '../../utils/transactionHelper';
import { toUtf8Bytes } from '@ethersproject/strings'

import {
  Proposal,
  ProposalOptions,
  PayloadType,
  ActionType,
} from '@aragon/govern';
export interface DaoSettingContainerProps {
  /**
   * on click back
   */
  onClickBack: () => void;
}

export interface DaoSettingFormProps {
  /**
   * on click back
   */
  onClickBack: () => void;
}

interface ParamTypes {
  /**
   * type of path (url) params
   */
  daoName: string;
}

const DaoSettingsForm: React.FC<DaoSettingFormProps> = ({ onClickBack }) => {
  
  const context: any = useWallet();
  const {
    connector,
    account,
    balance,
    chainId,
    connect,
    connectors,
    ethereum,
    error,
    getBlockNumber,
    networkName,
    reset,
    status,
    type,
    ethersProvider,
  } = context;


  const BackButton = styled('div')({
    height: 25,
    width: 62,
    cursor: 'pointer',
    position: 'relative',
    left: -6,
  });

  const Title = styled(Typography)({
    fontFamily: 'Manrope',
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: 28,
    lineHeight: '38px',
    color: '#20232C',
    marginTop: 17,
    height: 50,
    display: 'flex',
    justifyContent: 'start',
  });

  const InputTitle = styled(Typography)({
    width: '454px',
    fontFamily: 'Manrope',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 18,
    lineHeight: '25px',
    color: '#7483AB',
    marginTop: '17px',
  });

  const RuleTextArea = styled(TextArea)({
    background: '#FFFFFF',
    border: '2px solid #EFF1F7',
    boxSizing: 'border-box',
    boxShadow: 'inset 0px 2px 3px 0px rgba(180, 193, 228, 0.35)',
    borderRadius: '8px',
    width: '100%',
    height: 104,
    padding: '11px 21px',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '25px',
    letterSpacing: '0em',
    // border: '0 !important',
    '& .MuiInputBase-root': {
      border: 0,
      width: '100%',
      input: {
        width: '100%',
      },
    },
    '& .MuiInput-underline:after': {
      border: 0,
    },
    '& .MuiInput-underline:before': {
      border: 0,
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      border: 0,
    },
  });

  const [executionDelay, setExecutionDelay] = useState<string>();
  const [
    scheduleDepositContractAddress,
    setScheduleDepositContractAddress,
  ] = useState<string>();
  const [scheduleDepositAmount, setScheduleDepositAmount] = useState<string>();
  const [
    challengeDepositContractAddress,
    setChallengeDepositContractAddress,
  ] = useState<string>();
  const [challengeDepositAmount, setChallengeDepositAmoun] = useState<string>();
  const [resolverAddress, setResolverAddress] = useState<string>();
  const [rules, setRules] = useState<string>();
  const [justification, setJustification] = useState<string>();

  const onChangeExecutionDelay = (val: any) => {
    // executionDelay = val;
    setExecutionDelay(val);
  };

  const onScheduleDepositContractAddress = (val: any) => {
    setScheduleDepositContractAddress(val);
  };

  const onChangeScheduleDepositAmount = (val: any) => {
    setScheduleDepositAmount(val);
  };

  const onChangeChallengeDepositContractAddress = (val: any) => {
    setChallengeDepositContractAddress(val);
  };

  const onChangeChallengeDepositAmount = (val: any) => {
    setChallengeDepositAmoun(val);
  };

  const onChangeResolverAddress = (val: any) => {
    setResolverAddress(val);
  };

  const onChangeRules = (val: any) => {
    setRules(val.target.value);
  };

  const onChangeJustification = (val: any) => {
    setJustification(val.target.value);
  };

  const { daoName } = useParams<ParamTypes>();
  //TODO daoname empty handling
  const { data: daoList } = useQuery(GET_DAO_BY_NAME, {
    variables: { name: daoName },
  });

  const [daoDetails, updateDaoDetails] = useState<any>();
  const [proposal, setProposal] =  useState<any | null>();
  const [currentConfig, setCurrentConfig] = useState<any | null>();

  useEffect(() => {
    if (daoList) {
      updateDaoDetails(daoList.daos[0]);
    }
  }, [daoList]);

  useEffect(() => {
    if(daoDetails) {
      const _config = daoDetails.queue.config;
      setCurrentConfig(_config)
      onChangeExecutionDelay(_config.executionDelay);
      onScheduleDepositContractAddress(_config.scheduleDeposit.token);
      onChangeScheduleDepositAmount(_config.scheduleDeposit.amount);
      onChangeChallengeDepositContractAddress(_config.challengeDeposit.token);
      onChangeChallengeDepositAmount(_config.challengeDeposit.amount);
      onChangeResolverAddress(_config.resolver);
      setRules(_config.rules);

      const proposalOptions: ProposalOptions = {};
      const proposal = new Proposal(daoDetails.queue.address, proposalOptions)
      setProposal(proposal)
    }
  }, [daoDetails]);

  const [isOpen, setIsOpen] = useState(false);
  const [txList, setTxList] = useState<string[]>([]);
  const [isTrigger, setIsTrigger] = useState<boolean>(false);

  const closeModal = () => {
    setIsOpen(!isOpen);
  };

  const callSaveSetting = async () => {
    const newConfig = {
      executionDelay: executionDelay,
      scheduleDeposit: {
        token: scheduleDepositContractAddress,
        amount: scheduleDepositAmount
      },
      challengeDeposit: {
        token: challengeDepositContractAddress,
        amount: challengeDepositAmount
      },
      resolver: resolverAddress,
      rules: rules,
      maxCalldataSize: currentConfig.maxCalldataSize, // TODO: grab it from config subgraph too.
    };

    const submitter: string = account

    const payload = buildPayload({
      submitter, 
      executor: daoDetails.executor.address,
      actions: [proposal.buildAction('configure', [newConfig], 0)],
      executionDelay: daoDetails.queue.config.executionDelay,
      // proof: toUtf8Bytes(justification) // TODO Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
      proof: '0x'
    })

    // TODO:GIORGI error tracking make it better
    if(daoDetails.queue.config.scheduleDeposit.token !== '0x'+'0'.repeat(20)){
      const scheduleDepositApproval = await erc20ApprovalTransaction(
        daoDetails.queue.config.scheduleDeposit.token,
        daoDetails.queue.config.scheduleDeposit.amount,
        daoDetails.queue.address,
        ethersProvider,
        account,
      );

      if(scheduleDepositApproval.error) {
        console.log(scheduleDepositApproval.error, ' approval error')
      }
  
      if(scheduleDepositApproval.transactions.length > 0) {
        try {
          const transactionResponse: any = await scheduleDepositApproval.transactions[0].tx();
          await transactionResponse.wait();
        } catch (err) {
          console.log(err);
        }
      }
    }
    
    
    console.log(currentConfig, ' nice one')
    const scheduleResult = await proposal.schedule({
      payload: payload,
      config: currentConfig
    });

    // TODO: create tx object with attribute such as if tx is done using CiruclarProgressStatus
    // console.log('current input obj:', obj);
    // setTxList(['Transaction details 01', 'Transaction details 02']);
    setIsOpen(true);
  };

  const txReviewContainer = (
    <div
      style={{
        minWidth: '398px',
        minHeight: '124px',
        background: '#F6F9FC',
        borderRadius: '10px',
      }}
    >
      <div
        style={{
          fontFamily: 'Manrope',
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: '19px',
          color: '#0176FF',
          marginTop: '20px',
          marginLeft: '20px',
          marginBottom: '10px',
        }}
      >
        Transactions to be triggered:
      </div>
      {txList.map((tx) => {
        return (
          <div
            style={{
              fontFamily: 'Manrope',
              fontStyle: 'normal',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '22px',
              color: '#0176FF',
              marginLeft: '30px',
            }}
          >
            {'● ' + tx}
          </div>
        );
      })}
    </div>
  );

  const txTrigerContainer = (
    <div
      style={{
        minWidth: '398px',
        minHeight: '124px',
        background: '#F6F9FC',
        borderRadius: '10px',
      }}
    >
      <div
        style={{
          fontFamily: 'Manrope',
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: '19px',
          color: '#0176FF',
          marginTop: '20px',
          marginLeft: '20px',
          marginBottom: '10px',
        }}
      >
        Processing transactions
      </div>
      {txList.map((tx) => {
        return (
          <div
            style={{
              fontFamily: 'Manrope',
              fontStyle: 'normal',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '22px',
              color: '#0176FF',
              marginLeft: '30px',
            }}
          >
            <ANCircularProgressWithCaption state={CiruclarProgressStatus.Disabled} caption={tx} />
          </div>
        );
      })}
    </div>
  );

  const modalContainer = (
    <div>
      {isTrigger ? txTrigerContainer : txReviewContainer}
      <ANButton
        label={isTrigger ? 'Continue' : 'Get started'}
        type={'primary'}
        onClick={
          isTrigger
            ? () => console.log('call package')
            : () => setIsTrigger(true)
        }
        style={{ marginTop: '34px' }}
        width={'100%'}
      />
    </div>
  );

  return (
    <>
      <SimpleModal
        modalTitle={'Confirm transactions'}
        open={isOpen}
        onClose={closeModal}
        children={modalContainer}
      />
      <ANWrappedPaper>
        <BackButton onClick={onClickBack}>
          <img src={backButtonIcon} />
        </BackButton>
        <Title>DAO Settings</Title>
        <InputTitle>executionDelay</InputTitle>
        <InputField
          label=""
          onInputChange={onChangeExecutionDelay}
          value={executionDelay}
          height="46px"
          width={'inherited'}
          placeholder={'350s'}
        />
        <InputTitle>scheduleDeposit contract address</InputTitle>
        <InputField
          label=""
          onInputChange={onScheduleDepositContractAddress}
          value={scheduleDepositContractAddress}
          height="46px"
          width={'inherited'}
          placeholder={'0x0000...'}
        />
        <InputTitle>scheduleDeposit amount</InputTitle>
        <InputField
          label=""
          onInputChange={onChangeScheduleDepositAmount}
          value={scheduleDepositAmount}
          height="46px"
          width={'inherited'}
          placeholder={'150'}
        />
        <InputTitle>challengeDeposit contract address</InputTitle>
        <InputField
          label=""
          onInputChange={onChangeChallengeDepositContractAddress}
          value={challengeDepositContractAddress}
          height="46px"
          width={'inherited'}
          placeholder={'0x4c495F0005171E17c1dd08510g801805eE08E7'}
        />
        <InputTitle>challengeDeposit amount</InputTitle>
        <InputField
          label=""
          onInputChange={onChangeChallengeDepositAmount}
          value={challengeDepositAmount}
          height="46px"
          width={'inherited'}
          placeholder={'350'}
        />
        <InputTitle>resolver</InputTitle>
        <InputField
          label=""
          onInputChange={onChangeResolverAddress}
          value={resolverAddress}
          height="46px"
          width={'inherited'}
          placeholder={'0x4c495F0005171E17c1dd08510g801805eE08E7'}
        />
        <InputTitle>rules</InputTitle>
        <RuleTextArea onChange={onChangeRules} value={rules} />
        <InputTitle>Justification</InputTitle>
        <RuleTextArea onChange={onChangeJustification} value={justification} />

        {/* // TODO: for now it is hiden untill we have a working IPFS
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          verticalAlign: 'middle',
          lineHeight: '40px',
          marginTop: '17px'
        }}
      >
        <InputField
          label=""
          onInputChange={() => {}}
          value={''}
          height="46px"
          width={'423px'}
          placeholder={'Select A file...'}
        />
        <ANButton
          label={'Examine'}
          type={'secondary'}
          backgroundColor={'#FFFFFF'}
          color={'#20232C'}
          onClick={() => {}}
          style={{ marginLeft: '10px'}}
          disabled={true}
        />
      </div> */}
        <div
          style={{
            justifyContent: 'center',
            display: 'flex',
          }}
        >
          <ANButton
            label={'Save settings'}
            type={'primary'}
            onClick={callSaveSetting}
            style={{ marginTop: '34px' }}
            width={'100%'}
          />
        </div>
      </ANWrappedPaper>
    </>
  );
};

const DaoSettingsContainer: React.FC<DaoSettingContainerProps> = ({
  onClickBack,
}) => {
  return (
    <div
      style={{
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <DaoSettingsForm onClickBack={onClickBack} />
    </div>
  );
};

export default DaoSettingsContainer;