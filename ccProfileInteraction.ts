import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { contractAbi } from './abi/ProfileNFT';

dotenv.config(); // Load environment variables from .env file

// Private RPC to avoid front-run (only on BSC Mainnet)
const bscRpcUrl = process.env.BSC_RPC_TESTNET;
const contractAddress = process.env.PROFILE_NFT_ADDRESS_TESTNET;
const privateKey = process.env.PRIVATE_KEY;
const profileEthAddress = process.env.PROFILE_ETH_ADDRESS;
const profileHandleName = process.env.PROFILE_HANDLE_NAME;

const provider = new ethers.JsonRpcProvider(bscRpcUrl);
const wallet = new ethers.Wallet(privateKey!, provider);
const contract = new ethers.Contract(contractAddress!, contractAbi, wallet);

const validateVariables = () => {
    if (!bscRpcUrl || !contractAddress || !profileEthAddress || !profileHandleName || !privateKey) {
        throw new Error('Required environment variables are missing.');
    }

    if (!/^0x[0-9A-Fa-f]{40}$/.test(profileEthAddress)) {
        throw new Error('Invalid wallet address format.');
    }

    if (!/^(0x)?[0-9A-Fa-f]{64}$/.test(privateKey)) {
        throw new Error('Invalid private key.');
    }
};

const createProfile = async () => {
    try {
        const tx = await contract.createProfile({
            to: profileEthAddress,
            handle: profileHandleName,
            avatar: '',
            metadata: '',
            operator: '0x0000000000000000000000000000000000000000',
        }, '0x', '0x');

        await tx.wait();
    } catch (error) {
        console.error('Error during profile creation:', (error as Error).message);
    }
};

const getHandleName = async () => {
    try {
        const profileId = await contract.getPrimaryProfile(profileEthAddress);
        const retrievedHandleName = await contract.getHandleByProfileId(profileId.toString());

        console.log(`\nPrimary Handle Name for ${profileEthAddress}: ${retrievedHandleName}\n`);
    } catch (error) {
        console.error('Error retrieving handle name:', (error as Error).message);
    }
};

async function main() {
    validateVariables();
    await createProfile();
    await getHandleName();
}

main();
