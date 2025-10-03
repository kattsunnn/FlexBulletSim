import { Box, Typography } from '@mui/material';

function ProgressBar({ label, value }) {
  return (
    <Box>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Box sx={{
            height: 8,
            bgcolor: 'grey.300',
            borderRadius: 5,
            overflow: 'hidden',
            mt: 0.5,
        }}>
            <Box sx={{
                width: value,
                height: '100%',
                bgcolor: 'primary.main' 
            }} />
        </Box>
    </Box>
  );
}

export default ProgressBar;
