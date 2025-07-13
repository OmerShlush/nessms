import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent
} from '@mui/material';
import { IAccount } from '../../interfaces/account.interface';

interface AccountFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (account: Partial<IAccount>, update?: boolean) => void;
    account?: Partial<IAccount>; // Pass existing account for editing, undefined for adding
}

const AccountForm: React.FC<AccountFormProps> = ({ open, onClose, onSave, account }) => {
    const [editedAccount, setEditedAccount] = useState<Partial<IAccount>>({
        username: '',
        email: '',
        password: '',
        role: 'viewer' // Default role value is "viewer"
    });

    useEffect(() => {
        if (account) {
            setEditedAccount(account);
        } else {
            setEditedAccount({
                username: '',
                email: '',
                password: '',
                role: 'viewer' // Default role value is "viewer"
            });
        }
    }, [account]);

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
    ) => {
        const { name, value } = event.target;
        setEditedAccount((prevAccount) => ({
            ...prevAccount,
            [name]: value,
        }));
    };

    const handleSave = () => {
        if (account) {
            onSave(editedAccount, true); // Editing an existing account
        } else {
            onSave(editedAccount);
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="account-form-dialog-title">
            <DialogTitle id="account-form-dialog-title">
                {account ? 'Edit Account' : 'Add Account'}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Fill in the account details below.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Username"
                    fullWidth
                    name="username"
                    value={editedAccount.username}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Email"
                    fullWidth
                    name="email"
                    value={editedAccount.email}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Password"
                    fullWidth
                    type="password"
                    name="password"
                    value={editedAccount.password}
                    onChange={handleInputChange}
                />
                <FormControl fullWidth margin="dense">
                    <InputLabel>Role</InputLabel>
                    <Select
                        name="role"
                        value={editedAccount.role}
                        onChange={handleInputChange}
                    >
                        <MenuItem value="viewer">Viewer</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AccountForm;
