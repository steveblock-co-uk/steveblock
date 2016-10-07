#!/usr/bin/env python

# Updates photojournal to use the original for each photo.

# For each photo image, the original in the main Photos directory is located
# and copied to the photo journal, and the JSON updated. Handles both local and
# remote images. The new image is served at a local path which matches the path
# within the Photos directory, for consistency and to handle duplicate
# filenames.
#
# Overrides are used to handle instances where the original can not be found.

import json;
import re;
import os;
import shutil;
import subprocess;
import sys;

root_search_path = os.path.join('/Users', 'steveblock', 'Google Drive', 'Photos')

overrides = {
  # Local files, multiple hits
  '2014/DSC00338.JPG': '2014/LoggersSports/DSC00338.JPG',
  '2011/DSCN0223.JPG': '2011/NewYear2012/DSCN0223.JPG',
  '2011/DSCN0216.JPG': '2011/ChristmasWalk/DSCN0216.JPG',
  '2011/DSCN0005.JPG': '2011/AnneSailing/DSCN0005.JPG',
  '2008/IMGP3517.JPG': '2008/SoeldenSkiing/IMGP3517.JPG',
  '2008/IMGP3479.JPG': '2008/MountainBiking/IMGP3479.JPG',
  '2005/073105_docking.jpg': '2005/BelAir/073105_docking.jpg',
  '2005/IMG_3033.jpg': '2005/Rumney/IMG_3033.jpg',
  '1999/scan0002.jpg': '1999/NewYear2000/scan0002.jpg',
  '1999/scan0001.jpg': '1999/SnowdonBiking/scan0001.jpg',

  # Local files, no hits
  '2007/imgp1813.sized.jpg': '2007/Gullies/imgp1813.jpg',
  '2007/imgp1784.sized.jpg': '2007/SouthernPresidentials/imgp1784.jpg',
  '2007/imgp1669.sized.jpg': '2007/GlenBoulderBoottSpurMtWashingtonLoop/imgp1669.jpg',
  '2007/IMGP1631.sized.jpg': '2007/IceFest/IMGP1631.JPG',
  '2007/imgp1592.sized.jpg': '2007/KinsmanNotch/imgp1592.jpg',
  '2007/imgp1588.sized.jpg': '2007/LonesomeLake/imgp1588.jpg',
  '2007/imgp1583.sized.jpg': '2007/Monadnock/imgp1583.jpg',
  '2007/p2040115.sized.jpg': '2007/PlayingOnWashington/playingOnWashington.jpg',
  '2007/P1280035.sized.jpg': '2007/FlumeGorge/flume2.jpg',
  '2007/P1270003.sized.jpg': '2007/Pierce/pierce.jpg',
  '2007/P1210546.sized.jpg': '2007/Flume/flume.jpg',
  '2007/IMG_0202.sized.jpg': '2007/CrawfordTrio/crawfordTrio.jpg',
  '2003/snowball.jpg': '2003/Lents/Snow/110-1093_IMG.JPG',
  '2003/img_1262.jpg': '2003/JessDoesTheUKII/Punting1/IMG_1262.jpg',
  '2003/SodiumDrop.jpg': '2003/SodiumDrop/IMG_1769.JPG',
  '2003/Painting.jpg': '2004/Northannex/IMG_1792.JPG',
  '2004/washington.jpg': '2004/NorthEastIce/IMG_2008.jpg',
  '2004/skis.jpg': '2004/Skis/IMG_2092.jpg',
  '2004/room.jpg': '2004/RoomAtCruftlabs/IMG_2605.jpg',
  '2004/turds.jpg': '2004/RoomAtCruftlabs/IMG_2604.jpg',
  '2004/cruftwagon.jpg': '2005/Cruftwagon/IMG_2825.jpg',
  '2005/baldface.jpg': '2005/NEIce2/IMG_2888.jpg',
  '2005/ffridd.jpg': '2005/Ffridd/ffridd2005.jpg',
  '2006/iceFest.jpg': '2006/IceFest/DSC_0050.JPG',
  '2006/hawaii.jpg': '2006/Hawaii/StevesPhotos/IMGP0114.JPG',
  '2006/katahdin.jpg': '2006/Katahdin/IMGP0209.JPG',
  '2006/lakeview.jpg': '2006/LakeView/imgp0292.jpg',
  '2006/superverse.jpg': '2006/Superverse/imgp0351.jpg',
  '2006/cascades.jpg': '2006/Cascades/BostonBasin/imgp0405.jpg',
  '2009/afan.jpg': '2009/SouthWalesBiking/IMGP4591.JPG',
  '2009/funRun.jpg': '2009/FunRun/DSCF0016.JPG',
  '2009/cottage.jpg': '2009/Cottage/P1010589.JPG',
  '2009/sanFrancisco.jpg': '2009/SanFrancisco/IMGP5059.JPG',
  '2010/goldRush.jpg': '2010/GoldRush/CYB0225.JPG',
  '2010/gigRide.jpg': '2010/GigRide/IMGP5590.JPG',
  '2010/london10K.jpg': '2010/London10K/steve4.jpg',
  '2010/highestPointSouthEast.jpg': '2010/HighestPointSouthEast/IMGP5592.JPG',
  '2010/hopeValleyBikeChallenge.jpg': '2010/HopeBikeChallenge/IMGP5728.JPG',
  '2011/exmoorTrailRace.jpg': '2011/ExmoorTrailRace/exmoorTrailRace.JPG',
  '2011/devonTrailRace.jpg': '2011/DevonTrailRace/phcw_CTS11-The Edge_174.JPG',
  '2011/lilleyBellWedding.jpg': '2011/LilleyBellWedding/wpid8398-Lucy+John-1381-copy.jpg',
  '2012/transMongolian.jpg': '2012/LondonToSydney/IMG_20120904_124922.jpg',
  '2012/china.jpg': '2012/LondonToSydney/DSCN1324.JPG',
  '2012/nykGalaxy.jpg': '2012/LondonToSydney/IMG_0804.JPG',
  '2012/newcastleOvernight.jpg': '2012/NewcastleOvernight/IMG_20121202_071011.jpg',
  '2012/newYear.jpg': '2012/NewYear/IMG_20130101_001139.jpg',
  '2013/hawkesburyRiverBiking.jpg': '2013/HawkesburyRiverBiking/IMG_20130105_162756.jpg',
  '2013/hornsbyBiking.jpg': '2013/HornsbyBiking/IMG_20130112_150218.jpg',
  '2013/convict100.jpg': '2013/Convict100/CGCA0012-12x17.jpeg',
  '2013/hunterValleyRide.jpg': '2013/GoogleHunterValleyRide/IMG_20130904_143823.jpg',
  '2014/goatMountain.jpg': '2014/GoatMountain/GoatMountain3.jpg',
  '2014/bcmc.jpg': '2014/BCMC/BCMC2.jpg',

  # Wrong year
  '2011/IMGP7116.JPG': '2011/NewYear2012/IMGP7116.JPG',
  '2008/pc310841.jpg': '2008/NewYear08/pc310841.jpg',

  # Remote images
  'http://lh4.googleusercontent.com/-cmw8IbhNIqg/UQ9-0avzFvI/AAAAAAAAbwI/ai5LNjN4XKI/s800/IMG_20130204_201115.jpg': '2013/PostieBike1/IMG_20130204_201117.jpg',
  'http://lh6.googleusercontent.com/-BD8lG1pisC4/T5wv07rWIDI/AAAAAAAAYK4/NzAijHc9TzU/s800/jamiesWedding.jpg': '2011/JamiesWedding/jamiesWedding.jpeg',
  'http://lh5.googleusercontent.com/-CEw0GxzYiZ4/TSC0bvhe0oI/AAAAAAAAUGQ/L4i1iKBYAY0/s800/B%252BK_1217.jpg': '2010/BenAndKathsWedding/B+K_1217.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kLwhTidIE/AAAAAAAAEtE/KGDAVcuqJo8/s800/NewYear05.jpg': '2004/NewYear/IMG_2865.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kMBhTidTE/AAAAAAAADTw/8i-cqMB-CHc/s800/TalybontReservoir.jpg': '2004/Talybont/IMG_2850.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kMOhTidVE/AAAAAAAAEtI/qaYt5mZT60w/s800/Berwyns.jpg': '2004/Berwyns/IMG_2844.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kMXhTidcE/AAAAAAAAEtM/uV1CMhqZ0PM/s800/RailwayCarols04.jpg': '2004/RailwayCarols/File0005.jpg',
  'http://lh4.ggpht.com/steve.a.block/R5kMgRTidmE/AAAAAAAAEtQ/HQTvIj7D_Y0/s800/Ffridd04.jpg': '2004/Ffridd/IMG_2835.jpg',
  'http://lh6.ggpht.com/steve.a.block/R5kMsxTiduE/AAAAAAAADW4/htOPvHHFZ6Q/s800/BirthdayHiking.jpg': '2004/BirthdayHiking/IMG_2824.jpg',
  'http://lh6.ggpht.com/steve.a.block/R5kM2xTidwE/AAAAAAAADXE/xsa5Q00ZJH8/s800/NYCaving.jpg': '2004/NYCaving/IMG_2813.jpg',
  'http://lh6.ggpht.com/steve.a.block/R5fKDRTic1E/AAAAAAAADN4/K0pR_WVEMoQ/s800/Waterfalls.jpg': '2004/Waterfalls/IMG_2789.jpg',
  'http://lh3.ggpht.com/steve.a.block/R5kNOBTidyE/AAAAAAAADXQ/hnWm46DQL-Y/s800/Wunderbus.jpg': '2004/Wunderbus/IMG_2779.jpg',
  'http://lh6.ggpht.com/steve.a.block/R5kNVxTid0E/AAAAAAAADXc/aINYMXtfxZU/s800/CruftlabsParty.jpg': '2004/CruftlabsParty/IMG_2773.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kNvhTid2E/AAAAAAAADXo/6gQ9wUozW6Y/s800/Nationals.jpg': '2004/Nationals/IMG_2762.jpg',
  'http://lh4.ggpht.com/steve.a.block/R5kODRTid4E/AAAAAAAADX0/BkW22g0T6bk/s800/Sox.jpg': '2004/Sox/IMG_2742.jpg',
  'http://lh4.ggpht.com/steve.a.block/R5kOVRTid6E/AAAAAAAADYE/VVLI6zAUmz8/s800/Easterns.jpg': '2004/Easterns/IMG_2732.jpg',
  'http://lh6.ggpht.com/steve.a.block/R5kKDxTidEE/AAAAAAAADSE/6HsikOT6teM/s800/RoomAtCruftlabs.jpg': '2004/RoomAtCruftlabs/IMG_2722.jpg',
  'http://lh3.ggpht.com/steve.a.block/R5kPFBTid8E/AAAAAAAAEtU/GNU9xIIOFyA/s800/PemiLoop.jpg': '2004/PemiLoop/IMG_2708.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kPlhTieXE/AAAAAAAADbk/sBAAT9Xyk70/s800/CapeCodBiking.jpg': '2004/CapeCodBiking/IMG_2679.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kKahTidGE/AAAAAAAADSQ/mQ0LhxNMFtM/s800/UMassRace.jpg': '2004/UMass/UMass.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kPrhTieZE/AAAAAAAADbw/MyI7bOzX148/s800/IslandCamping.jpg': '2004/IslandCamping/IMG_2669.jpg',
  'http://lh3.ggpht.com/steve.a.block/R5kP0BTiebE/AAAAAAAADb8/y1BRA2brPOM/s800/UNHRace.jpg': '2004/UNH/IMG_2658.jpg',
  'http://lh3.ggpht.com/steve.a.block/R5kQSBTiedE/AAAAAAAADcI/Lbu4TtQrk3I/s800/Plattekill.jpg': '2004/Plattekill/IMG_2633.jpg',
  'http://lh3.ggpht.com/steve.a.block/R5kQnBTiefE/AAAAAAAAEtY/IuHYVnsQbmU/s800/Paragliding02.jpg': '2004/Paragliding/IMG_2625.jpg',
  'http://lh4.ggpht.com/steve.a.block/R5kQ8RTiexE/AAAAAAAADek/beU5SK0Gyxo/s800/CherryMountain.jpg': '2004/CherryMountain/IMG_2601.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kQ-hTiezE/AAAAAAAADew/cgIPP9xge9o/s800/Walden.jpg': '2004/Walden/IMG_2595.jpg',
  'http://lh4.ggpht.com/steve.a.block/R5kRARTie1E/AAAAAAAADe8/V3a89wIZ6Gw/s800/ErectionParty.jpg': '2004/ErectionParty/erection2.jpeg',
  'http://lh6.ggpht.com/steve.a.block/R5kRCxTie3E/AAAAAAAADfI/dInHqaEQ2RQ/s800/Malverns.jpg': '2004/Malverns/IMG_2593.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kRNhTie5E/AAAAAAAADfU/A7WLMK3v2Qo/s800/BenSLandrover.jpg': '2004/BensLandrover/IMG_2586.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kSlhTie7E/AAAAAAAADfo/YdcuLBjBLJ8/s800/HarrisFamily.jpg': '2004/HarrisFamily/IMG_2581.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kS1hTie9E/AAAAAAAAEtc/uHs9QAPMrTg/s800/PresidentiaLTraverse.jpg': '2004/PresidentialTraverse/IMG_2540.jpg',
  'http://lh6.ggpht.com/steve.a.block/R5fJsRTiczE/AAAAAAAADNs/6nc_1URSiRY/s800/CapeCod.jpg': '2004/CapeCod/IMG_2492.jpg',
  'http://lh6.ggpht.com/steve.a.block/R5kTSxTifQE/AAAAAAAADiU/_cx8V9Qs0yE/s800/Marathon04.jpg': '2004/Marathon/IMG_2177.jpg',
  'http://lh6.ggpht.com/steve.a.block/R5kTqxTifSE/AAAAAAAAEtg/6YwXGe_w3nE/s800/Gullies02.jpg': '2004/Gullies/shoestring_gully07alpinisme04.sized.jpeg',
  'http://lh6.ggpht.com/steve.a.block/R5kUBxTifnE/AAAAAAAAEto/YS4SKmBvazk/s800/Lafeyette.jpg': '2004/Lafeyette/26-Windy_ridge.jpeg',
  'http://lh4.ggpht.com/steve.a.block/R5kUJRTifxE/AAAAAAAADmk/wFwdyr0UcrI/s800/Presidentials.jpg': '2004/Presidentials/IMG_2120.jpg',
  'http://lh4.ggpht.com/steve.a.block/R5kUQRTifzE/AAAAAAAADm0/6v5yg7caYG4/s800/Flume.jpg': '2004/Flume/IMG_2081.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kUXhTif1E/AAAAAAAADnA/PgRo3JvWMuA/s800/Sunapee.jpg': '2004/Sunapee/IMG_2058.jpg',
  'http://lh4.ggpht.com/steve.a.block/R5kUrRTif3E/AAAAAAAADnU/Kyqa8mSh7yY/s800/Chocorua.jpg': '2004/Chocorua/IMG_1959.jpg',
  'http://lh3.ggpht.com/steve.a.block/R5kUvBTif5E/AAAAAAAADng/Y8U3cvz68O0/s800/LockwoodSChimney.jpg': '2004/LockwoodsChimney/IMG_1951.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kZGhTif7E/AAAAAAAADok/1ljdKfji_eY/s800/NewYear04.jpg': '2003/NewYear/IMG_1949.jpg',
  'http://lh4.ggpht.com/steve.a.block/R5kZZRTif9E/AAAAAAAADow/5GdyvQow-34/s800/Montreal.jpg': '2003/Montreal/IMG_1938.jpg',
  'http://lh6.ggpht.com/steve.a.block/R5kZ6xTif_E/AAAAAAAAEtw/RPkpyKOpzKs/s800/Washington.jpg': '2003/Washington/P1010016.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kaNhTigPE/AAAAAAAADrA/3Oqf_jTqxOQ/s800/Snow.jpg': '2003/Snow/IMG_1895.jpg',
  'http://lh3.ggpht.com/steve.a.block/R5kajBTigRE/AAAAAAAADrQ/QSMtZWZMFZo/s800/BertAndErnie.jpg': '2003/BertAndErnie/IMG_1834.jpg',
  'http://lh3.ggpht.com/steve.a.block/R5ka6BTigTE/AAAAAAAADrc/G2LUzWIV7lo/s800/HeadOfTheCharles.jpg': '2003/HeadOfTheCharles/IMG_1817.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kbMhTigVE/AAAAAAAADrw/8Dy_-EVix80/s800/Monadnock.jpg': '2003/Monadnock/IMG_1798.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kbnhTigbE/AAAAAAAADsg/_HNFE-Bc_6U/s800/WhaleWatching.jpg': '2003/Orientation/IMG_1785.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kcXhTigfE/AAAAAAAADtA/Dbmyipv2t44/s800/RoadTripII.jpg': '2003/RoadTrip2/Graceland/IMG_1751.JPG',
  'http://lh6.ggpht.com/steve.a.block/R5kckxTighE/AAAAAAAADtM/0fuVmIFODn8/s800/SleeplessInTheSaddle.jpg': '2003/SleeplessInTheSaddle/sleepless.jpg',
  'http://lh6.ggpht.com/steve.a.block/R5kcqxTigjE/AAAAAAAADtY/6n-l44-9zOo/s800/SouthWestClimbing.jpg': '2003/SouthWestClimbing/southwest003.jpg',
  'http://lh6.ggpht.com/steve.a.block/R5fIfRTicxE/AAAAAAAADP8/K3Ct0aGMhKk/s800/Dublin.jpg': '2003/Dublin/Dublin003.jpg',
  'http://lh4.ggpht.com/steve.a.block/R5kduRTiglE/AAAAAAAAEuU/w3SPJIFo07g/s800/EuropeBiking.jpg': '2003/Europe/TheFrenchAlps/Europe067.jpg',
  'http://lh4.ggpht.com/steve.a.block/R5ky_RTih4E/AAAAAAAAD5A/QXLHBIOvSM4/s800/Henley.jpg': '2003/Henley/Henley005.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5kzOhTih6E/AAAAAAAAD5M/DOhy_YnfZJk/s800/MountainMayhem.jpg': '2003/MountainMayhem/mountainmayhempic1796.jpeg',
  'http://lh5.ggpht.com/steve.a.block/R5o32RTih8E/AAAAAAAAD5w/wAi4gTpDxZ8/s800/MayBall.jpg': '2003/JessDoesTheUKII/MayBall03/mayball006.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5o5LRTih-E/AAAAAAAAEuY/eE_vvy0gY_Q/s800/MayBumps.jpg': '2003/Mays/SaturdayRacing/LMBCII.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5o8GRTiicE/AAAAAAAAD9s/m86sL0wSDJE/s800/Blimp.jpg': '2003/Blimp/blimp1.jpg',
  'http://lh5.ggpht.com/steve.a.block/R5o8dRTiigE/AAAAAAAAD-E/41H_zvW6yGg/s800/Protests.jpg': '2003/Protests/111-1133_IMG.JPG',
  'http://lh5.ggpht.com/steve.a.block/R5o8mRTiiiE/AAAAAAAAD-Q/EqKZ8nJVKcM/s800/Helmsley.jpg': '2003/Helmsley/111-1117_IMG.JPG',
  'http://lh3.ggpht.com/steve.a.block/R5o9JhTiilI/AAAAAAAAD-Y/3KthvuPsp90/s800/elen1.jpg': '2003/Lents/WetM2/elen1.jpeg',
  'http://lh5.ggpht.com/steve.a.block/R5o9rRTiimE/AAAAAAAAD-o/PXyq4ifyQus/s800/NewYear03.jpg': '2002/NewYear/110-1073_IMG.JPG',
  'http://lh3.ggpht.com/steve.a.block/R5o_yxTiioE/AAAAAAAAEuk/-gmyRtJmppg/s800/Tryfan.jpg': '2002/Tryfan/110-1064_IMG.JPG',
  'http://lh3.ggpht.com/steve.a.block/R5pALxTijEE/AAAAAAAAECU/3emb8J1KwSY/s800/CwnCneifon.jpg': '2002/CwmCneifion/110-1056_IMG.JPG',
  'http://lh3.ggpht.com/steve.a.block/R5pAdxTijGE/AAAAAAAAEus/bn3EPVakaNs/s800/Ffridd.jpg': '2002/Ffridd/110-1050_IMG.JPG',
  'http://lh6.ggpht.com/steve.a.block/R5pAnhTijME/AAAAAAAAEDQ/vw6V3JBgsSw/s800/Edale.jpg': '2002/Edale/110-1043_IMG.JPG',
  'http://lh3.ggpht.com/steve.a.block/R5pBNxTijOE/AAAAAAAAEDc/1xtpdy36O7Y/s800/Sheffield.jpg': '2002/Sheffield/landy2.JPG',
  'http://lh4.ggpht.com/steve.a.block/R5pBeBTijQE/AAAAAAAAEDo/YNfL2Rr7OY0/s800/Dales.jpg': '2002/Dales/110-1023_IMG.JPG',
  'http://lh6.ggpht.com/steve.a.block/R5pB0hTijSE/AAAAAAAAED4/bb4FFgo33OM/s800/LandRoverNote.jpg': '2002/LandRoverNote/note.jpg',
  'http://lh3.ggpht.com/steve.a.block/R5pB_xTijUE/AAAAAAAAEuw/EObvnkpZGaQ/s800/ClarksvilleCave.jpg': '2002/Clarksville/IMG_0980.JPG',
  'http://lh5.ggpht.com/steve.a.block/R55MWRTikiE/AAAAAAAAEu8/SKoRNz15dPY/s800/RoadTrip.jpg': '2002/RoadTrip/Outbound/Day6/107-0720_IMG.JPG',
  'http://lh3.ggpht.com/steve.a.block/R55S0xTimOE/AAAAAAAAEvE/NJGwrxOsVNc/s800/RhysWedding.jpg': '2002/RhysWedding/105-0511_IMG.JPG',
  'http://lh4.ggpht.com/steve.a.block/R55TjBTimYE/AAAAAAAAEvI/IeWOMHe4_zs/s800/Newquay.jpg': '2002/Newquay/Fishing/104-0450_IMG.JPG',
  'http://lh4.ggpht.com/steve.a.block/R55UpBTimpE/AAAAAAAAEhg/wyieUyBC_ec/s800/CapeCod02.jpg': '2002/CapeCod/car.jpg',
  'http://lh6.ggpht.com/steve.a.block/R55U0hTimrE/AAAAAAAAEhs/ihMnQvFz0HY/s800/SundayRiver.jpg': '2002/SundayRiver/111-1138_IMG.JPG',
  'http://lh4.ggpht.com/steve.a.block/R55VCBTimtE/AAAAAAAAEh4/k1jQYcNkXVI/s800/Flume02.jpg': '2002/Flume/IceClimbing2.JPG',
  'http://lh3.ggpht.com/steve.a.block/R55VjxTimvE/AAAAAAAAEiE/Px37MCPawc0/s800/NYC.jpg': '2002/NYC/111-1109_IMG.JPG',
  'http://lh6.ggpht.com/steve.a.block/R55aKhTimxE/AAAAAAAAEvY/ENHtltjqTIE/s800/NewYear02.jpg': '2001/NewYear/110-1084_IMG.JPG',
  'http://lh6.ggpht.com/steve.a.block/R55ahhTinHE/AAAAAAAAEn4/Nglcos98GRE/s800/Brecons.jpg': '2001/Brecons/110-1014_IMG.JPG',
  'http://lh4.ggpht.com/steve.a.block/R55a7BTinfE/AAAAAAAAEoE/i_Wy09rShdY/s800/Railway.jpg': '2001/Railway/109-0976_IMG.JPG',
  'http://lh6.ggpht.com/steve.a.block/R55bNhTinhE/AAAAAAAAEoU/Vqc_PohL_pE/s800/Waterville.jpg': '2001/Waterville/109-0956_IMG.JPG',
  'http://lh5.ggpht.com/steve.a.block/R55bcRTinjE/AAAAAAAAEok/5NyCmPex3JU/s800/Leonids.jpg': '2001/Leonids/108-0872_IMG.JPG',
  'http://lh5.ggpht.com/steve.a.block/R55buRTinlE/AAAAAAAAEow/eX1U2Dia34I/s800/FootOfTheCharles.jpg': '2001/FootOfTheCharles/FC04-14-1.jpg',
  'http://lh4.ggpht.com/steve.a.block/R55b6BTinnE/AAAAAAAAEpA/lQMvApqrQqE/s800/MorrisCave.jpg': '2001/Morris/107-0701_IMG.JPG',
  'http://lh5.ggpht.com/steve.a.block/R55c5RTinpE/AAAAAAAAEpc/LgMhAOJqX2c/s800/JamieS21st.jpg': '2001/Jamies21st/105-0591_IMG.JPG',
  'http://lh3.ggpht.com/steve.a.block/R55dKxTinrE/AAAAAAAAEpo/FCIpIFKvPSk/s800/Llanrhaeder.jpg': '2001/Llanrhaeder/101-0001_AUT.JPG',
  'http://lh6.ggpht.com/steve.a.block/R55dVhTintE/AAAAAAAAEp0/eW3_28pEdq0/s800/UntitledBoulder.jpg': '2001/UntitledBoulder/101-0013_AUT.JPG',
  'http://lh6.ggpht.com/steve.a.block/R55dfhTinvE/AAAAAAAAEqA/qQJz9uye2zk/s800/Mexican.jpg': '2001/Mexican/100-0083_AUT.JPG',
  'http://lh5.ggpht.com/steve.a.block/R55d2RTinxE/AAAAAAAAEqM/WqDilPGvejA/s800/MayBumps02.jpg': '2001/Mays/Mens2021.jpg',
  'http://lh5.ggpht.com/steve.a.block/R55eqRTin1E/AAAAAAAAEqk/lsfZxE6h1cQ/s800/TheRoaches.jpg': '2000/Roaches/100-0025_AUT.JPG',
}

def find_photos_from_year(filename, year):
  search_path = os.path.normpath(os.path.join(root_search_path, '%s' % year))
  print 'Searching in %s for %s' % (search_path, filename)
  args = ['find', search_path, '-iname', filename]
  proc = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  stdout, stderr = proc.communicate()
  return [os.path.relpath(x, root_search_path) for x in stdout.splitlines() if "/Originals/" not in x and "/.picasaoriginals/" not in x]

def copy_file(source, destination):
  print 'Copying %s to %s' % (source, destination)
  dir = os.path.dirname(destination)
  if not os.path.isdir(dir):
    os.makedirs(dir)
  shutil.copy(source, destination)

def delete_file(target):
  print 'Deleting %s' % target
  os.remove(target)

def get_new_photo_path(year, photo_path):
  if (overrides.get(photo_path)):
    print 'Got override for %s: %s' % (photo_path, overrides.get(photo_path))
    return overrides.get(photo_path)
  filename = os.path.basename(photo_path)
  hits = find_photos_from_year(filename, year)
  if len(hits) == 0:
    raise Exception('No hits for %s in %s' % (photo_path, year))
  elif len(hits) > 1:
    raise Exception('Multiple hits for %s in %s: %s' % (photo_path, year, hits))
  return hits[0]

def main():
  data_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json')
  data_file = open(data_file_path)
  json_data_string = data_file.read()
  data = json.loads(json_data_string)
  for entry in data:
    if entry.get('photo'):
      year = entry['year']
      photo_path = entry['photo']
      new_photo_path = get_new_photo_path(year, photo_path)
      root_new_photo_path = os.path.join(root_search_path, new_photo_path)
      if not photo_path.startswith('http'):
        if (os.path.getsize(root_new_photo_path) < os.path.getsize(photo_path)):
          raise Exception('Source smaller than target: %s(%s) vs %s(%s)' % (new_photo_path, os.path.getsize(root_new_photo_path), photo_path, os.path.getsize(photo_path)))
        delete_file(photo_path)
      entry['photo'] = new_photo_path
      copy_file(root_new_photo_path, new_photo_path)
  output_file = open(re.sub('.json', '.new.json', data_file_path), 'w')
  json.dump(data, output_file, indent=2, separators=(',', ': '), sort_keys=True)
  output_file.close()

if __name__ == '__main__':
  sys.exit(main())
