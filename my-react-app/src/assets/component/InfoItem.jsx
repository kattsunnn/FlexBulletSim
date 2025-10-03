
import { Box, Typography } from '@mui/material';

function InfoItem({ label, value }) {
  return (
    <Box sx={{ my: 1 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}

export default InfoItem;