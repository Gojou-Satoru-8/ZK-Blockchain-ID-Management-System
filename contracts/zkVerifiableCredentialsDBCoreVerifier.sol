// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 20491192805390485299153009773594534940189261866228447918068658471970481763042;
    uint256 constant alphay  = 9383485363053290200918347156157836566562967994039712273449902621266178545958;
    uint256 constant betax1  = 4252822878758300859123897981450591353533073413197771768651442665752259397132;
    uint256 constant betax2  = 6375614351688725206403948262868962793625744043794305715222011528459656738731;
    uint256 constant betay1  = 21847035105528745403288232691147584728191162732299865338377159692350059136679;
    uint256 constant betay2  = 10505242626370262277552901082094356697409835680220590971873171140371331206856;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 1441392006677391303778912845463973351587391258908292364551633169430841185161;
    uint256 constant deltax2 = 15194688960998662642747404974815166207701733133988332288007543485395835794536;
    uint256 constant deltay1 = 1918812456793633619891029700793934961140022196294940196973779792140212971631;
    uint256 constant deltay2 = 17363643521901516905670682302330000393828801352664959546753913859885342261624;

    
    uint256 constant IC0x = 6604500055927554601142439115822671659411017068367436463858287027280914663542;
    uint256 constant IC0y = 21030098351952187233746899459710641042355712345461671453740158245116328498339;
    
    uint256 constant IC1x = 502080834310351505583042926120031104630149716321695635659644657827755750738;
    uint256 constant IC1y = 16370460724195964468945361546470060584979067905887080204771063908795885243787;
    
    uint256 constant IC2x = 6592685645408395620218591755232191594120318435231648716742934360760507952533;
    uint256 constant IC2y = 2620214365719326274839237352596800754009175243022556476106609295732317854689;
    
    uint256 constant IC3x = 6489888039114073854688270702788771264886965855354113395779494048046527973160;
    uint256 constant IC3y = 10193055796431644118386548243108256318028558316585064454329727036143486706694;
    
    uint256 constant IC4x = 13813532961509323836362035186192331428789564295157876286937366747731284747910;
    uint256 constant IC4y = 16406569862589134829127330669273962835618206207602141245531759766059839605710;
    
    uint256 constant IC5x = 16672980053235131991901724503087579650607226862488443612982744088246436342605;
    uint256 constant IC5y = 1654298678250390518870862626507332824663619050586392055910567485952086146918;
    
    uint256 constant IC6x = 18745957970602735758184091683200114883833916521559306428578704352382786644948;
    uint256 constant IC6y = 18747090542153078241521965963886137732931466363266197648357039120556289760143;
    
    uint256 constant IC7x = 14659223468238626717739462207536212944491570839502789040864953821547551150807;
    uint256 constant IC7y = 5143988075652979864557059505365083591730331564200142998678614601970553495112;
    
    uint256 constant IC8x = 10207600245201632935928396429745126300552878613072828814854659851965411196530;
    uint256 constant IC8y = 5362462056724422920628458935166811117938165744083035355538188203033755980595;
    
    uint256 constant IC9x = 9925546049122926174867098629913902207575741554648090968735007496922265071506;
    uint256 constant IC9y = 411035308608789160080753137954073071889013476644697613413670966020901565523;
    
    uint256 constant IC10x = 3031987322624025633413215288858781636710214399466988366207834719324232400480;
    uint256 constant IC10y = 5692520849604516946449421190431608710617395666937467159175948470930465074862;
    
    uint256 constant IC11x = 18263530245922937927564493400503518799310833676790652849964806296347141206092;
    uint256 constant IC11y = 4803030724016770458223429487457170170025770221218910460883687135577142215272;
    
    uint256 constant IC12x = 7559077922068816071816724247752087847046189176392497503230478310149593295292;
    uint256 constant IC12y = 20084512706735516191871031955158239659343756652320047680943154734615272229756;
    
    uint256 constant IC13x = 1778510532107348385479577719514403426434905287248596520734144452918047158556;
    uint256 constant IC13y = 17907948114420440007340128176625859490823615979841318190402835871865192784009;
    
    uint256 constant IC14x = 5212005351278010625614599492759587891073541681918463171032353788918040434419;
    uint256 constant IC14y = 3718799315529392391934235047027176816460403250137170290488888648472285099922;
    
    uint256 constant IC15x = 8892338185040369976825508315889683511674485178793288375091495001413188680046;
    uint256 constant IC15y = 7733821143955587431043260238084063272195750546045792128646595435553437365948;
    
    uint256 constant IC16x = 8384062666117101416760729508557311941104986990747465200574986514738113382463;
    uint256 constant IC16y = 447244637555886847698402574063558853706293562167946742067468849915430081763;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[16] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }
            
            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x
                
                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))
                
                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))
                
                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))
                
                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))
                
                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))
                
                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))
                
                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))
                
                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))
                
                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))
                
                g1_mulAccC(_pVk, IC10x, IC10y, calldataload(add(pubSignals, 288)))
                
                g1_mulAccC(_pVk, IC11x, IC11y, calldataload(add(pubSignals, 320)))
                
                g1_mulAccC(_pVk, IC12x, IC12y, calldataload(add(pubSignals, 352)))
                
                g1_mulAccC(_pVk, IC13x, IC13y, calldataload(add(pubSignals, 384)))
                
                g1_mulAccC(_pVk, IC14x, IC14y, calldataload(add(pubSignals, 416)))
                
                g1_mulAccC(_pVk, IC15x, IC15y, calldataload(add(pubSignals, 448)))
                
                g1_mulAccC(_pVk, IC16x, IC16y, calldataload(add(pubSignals, 480)))
                

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F
            
            checkField(calldataload(add(_pubSignals, 0)))
            
            checkField(calldataload(add(_pubSignals, 32)))
            
            checkField(calldataload(add(_pubSignals, 64)))
            
            checkField(calldataload(add(_pubSignals, 96)))
            
            checkField(calldataload(add(_pubSignals, 128)))
            
            checkField(calldataload(add(_pubSignals, 160)))
            
            checkField(calldataload(add(_pubSignals, 192)))
            
            checkField(calldataload(add(_pubSignals, 224)))
            
            checkField(calldataload(add(_pubSignals, 256)))
            
            checkField(calldataload(add(_pubSignals, 288)))
            
            checkField(calldataload(add(_pubSignals, 320)))
            
            checkField(calldataload(add(_pubSignals, 352)))
            
            checkField(calldataload(add(_pubSignals, 384)))
            
            checkField(calldataload(add(_pubSignals, 416)))
            
            checkField(calldataload(add(_pubSignals, 448)))
            
            checkField(calldataload(add(_pubSignals, 480)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
