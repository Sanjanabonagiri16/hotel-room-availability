import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/pms-inventory', async (req, res) => {
  // Return a hardcoded XML response for testing
  res.send(`<?xml version="1.0" encoding="UTF-8"?><RES_Response>
    <RoomInfo>
        <Source name="Front">
            <RoomTypes>
                <RoomType>
                    <RoomTypeID>1234500000000000001</RoomTypeID>
                    <FromDate>2020-03-11</FromDate>
                    <ToDate>2020-03-16</ToDate>
                    <Availability>1</Availability>
                </RoomType>
                <RoomType>
                    <RoomTypeID>1234500000000000007</RoomTypeID>
                    <FromDate>2020-03-18</FromDate>
                    <ToDate>2020-03-18</ToDate>
                    <Availability>5</Availability>
                </RoomType>
            </RoomTypes>
        </Source>
    </RoomInfo>
</RES_Response>`);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 