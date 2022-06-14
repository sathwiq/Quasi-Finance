import * as React from 'react';
import {useEffect} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import {Stack} from "@mui/material";
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function ErrorModal(props) {
    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
        props.onClose();
    };

    useEffect(()=>{
        setOpen(props.open);
    },[props.open]);

    return (
        <Modal
            open={open}
            onClose={(_, reason) => {
                if (reason !== "backdropClick") {
                    handleClose();
                }
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Stack spacing={2} alignItems="center" justifyContent="center">
                    <SentimentVeryDissatisfiedIcon color="success" sx={{ fontSize: 40 }}/>
                    <Typography id="modal-modal-title" color="text.primary" variant="h6" component="h2">
                        Error
                    </Typography>
                    <Typography color="text.primary" id="modal-modal-description" sx={{ mt: 2 }}>
                        {props.message}
                    </Typography>

                    <Button color="primary" onClick={handleClose} variant="contained" fullWidth>
                        Ok
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
}