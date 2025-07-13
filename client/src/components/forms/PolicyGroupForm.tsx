/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Button,
    Typography,
    Divider
} from '@mui/material';
import { IPolicyGroup } from '../../interfaces/policyGroup.interface'; // Update the import path

interface PolicyGroupFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (policyGroup: IPolicyGroup, update?: boolean) => void;
    policyGroup?: IPolicyGroup; // Pass existing policy group for editing, undefined for adding
}

const PolicyGroupForm: React.FC<PolicyGroupFormProps> = ({ open, onClose, onSave, policyGroup }) => {
    const [editedPolicyGroup, setEditedPolicyGroup] = useState<IPolicyGroup>({
        name: '',
        systems: [],
    });

    useEffect(() => {
        if (policyGroup) {
            setEditedPolicyGroup(policyGroup);
        } else {
            setEditedPolicyGroup({
                name: '',
                systems: [],
            });
        }
    }, [policyGroup]);

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;
        setEditedPolicyGroup((prevPolicyGroup) => ({
            ...prevPolicyGroup,
            [name]: value,
        }));
    };

    const handleSystemChange = (index: number, field: keyof typeof editedPolicyGroup.systems[number], value: any) => {
        const updatedSystems = [...editedPolicyGroup.systems];
        updatedSystems[index][field] = value;
        setEditedPolicyGroup((prevPolicyGroup) => ({
            ...prevPolicyGroup,
            systems: updatedSystems,
        }));
    };

    const handleSystemSeverityChange = (
        index: number,
        severityType: 'sms' | 'email',
        severityLevel: 'min' | 'max',
        value: string
    ) => {
        const updatedSystems = [...editedPolicyGroup.systems];
        updatedSystems[index].severity[severityType][severityLevel] = parseInt(value, 10) || 0;
        setEditedPolicyGroup((prevPolicyGroup) => ({
            ...prevPolicyGroup,
            systems: updatedSystems,
        }));
    };
    

    const handleAddSystem = () => {
        const newSystem = {
            hostname: '',
            probe: '',
            source: '',
            message: '',
            subsys: '',
            user_tag1: '',
            user_tag2: '',
            custom_1: '',
            custom_2: '',
            custom_3: '',
            custom_4: '',
            custom_5: '',
            severity: {
                sms: { min: 0, max: 5 },
                email: { min: 0, max: 5 },
            },
        };
        setEditedPolicyGroup((prevPolicyGroup) => ({
            ...prevPolicyGroup,
            systems: [...prevPolicyGroup.systems, newSystem],
        }));
    };

    const handleRemoveSystem = (index: number) => {
        const updatedSystems = [...editedPolicyGroup.systems];
        updatedSystems.splice(index, 1);
        setEditedPolicyGroup((prevPolicyGroup) => ({
            ...prevPolicyGroup,
            systems: updatedSystems,
        }));
    };

    const handleSave = () => {
        if (policyGroup) {
            onSave(editedPolicyGroup, true); // Editing an existing policy group
        } else {
            onSave(editedPolicyGroup);
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="policy-group-form-dialog-title">
            <DialogTitle id="policy-group-form-dialog-title">
                {policyGroup ? 'Edit Policy Group' : 'Add Policy Group'}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Fill in the policy group details below.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Policy Name"
                    fullWidth
                    name="name"
                    value={editedPolicyGroup.name}
                    onChange={handleInputChange}
                />
                {editedPolicyGroup.systems.map((system, index) => (
                    <div key={index}>
                        <Divider />
                        <Typography variant="subtitle1" gutterBottom>
                            System #{index + 1}
                        </Typography>

                        <TextField
                            margin="dense"
                            label={`Hostname`}
                            fullWidth
                            name="hostname"
                            value={system.hostname}
                            onChange={(e) => handleSystemChange(index, 'hostname', e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label={`Probe`}
                            fullWidth
                            name="probe"
                            value={system.probe}
                            onChange={(e) => handleSystemChange(index, 'probe', e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label={`Source`}
                            fullWidth
                            name="source"
                            value={system.source}
                            onChange={(e) => handleSystemChange(index, 'source', e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label={`Message`}
                            fullWidth
                            name="message"
                            value={system.message}
                            onChange={(e) => handleSystemChange(index, 'message', e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label={`Subsys`}
                            fullWidth
                            name="subsys"
                            value={system.subsys}
                            onChange={(e) => handleSystemChange(index, 'subsys', e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="SMS Min Severity"
                            fullWidth
                            type="number"
                            value={system.severity.sms.min}
                            onChange={(e) => handleSystemSeverityChange(index, 'sms', 'min', e.target.value)}
                        />

                        <TextField
                            margin="dense"
                            label="SMS Max Severity"
                            fullWidth
                            type="number"
                            value={system.severity.sms.max}
                            onChange={(e) => handleSystemSeverityChange(index, 'sms', 'max', e.target.value)}
                        />

                        <TextField
                            margin="dense"
                            label="Email Min Severity"
                            fullWidth
                            type="number"
                            value={system.severity.email.min}
                            onChange={(e) => handleSystemSeverityChange(index, 'email', 'min', e.target.value)}
                        />

                        <TextField
                            margin="dense"
                            label="Email Max Severity"
                            fullWidth
                            type="number"
                            value={system.severity.email.max}
                            onChange={(e) => handleSystemSeverityChange(index, 'email', 'max', e.target.value)}
                        />

                        <TextField
                            margin="dense"
                            label={`User Tag 1`}
                            fullWidth
                            name="user_tag1"
                            value={system.user_tag1}
                            onChange={(e) => handleSystemChange(index, 'user_tag1', e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label={`User Tag 2`}
                            fullWidth
                            name="user_tag2"
                            value={system.user_tag2}
                            onChange={(e) => handleSystemChange(index, 'user_tag2', e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label={`Custom 1`}
                            fullWidth
                            name="custom_1"
                            value={system.custom_1}
                            onChange={(e) => handleSystemChange(index, 'custom_1', e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label={`Custom 2`}
                            fullWidth
                            name="custom_2"
                            value={system.custom_2}
                            onChange={(e) => handleSystemChange(index, 'custom_2', e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label={`Custom 3`}
                            fullWidth
                            name="custom_3"
                            value={system.custom_3}
                            onChange={(e) => handleSystemChange(index, 'custom_3', e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label={`Custom 4`}
                            fullWidth
                            name="custom_4"
                            value={system.custom_4}
                            onChange={(e) => handleSystemChange(index, 'custom_4', e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label={`Custom 5`}
                            fullWidth
                            name="custom_2"
                            value={system.custom_5}
                            onChange={(e) => handleSystemChange(index, 'custom_5', e.target.value)}
                        />
                        <Button onClick={() => handleRemoveSystem(index)} color="secondary">
                            Remove System
                        </Button>
                    </div>
                ))}
                <Button onClick={handleAddSystem} color="primary">
                    Add System
                </Button>
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

export default PolicyGroupForm;
