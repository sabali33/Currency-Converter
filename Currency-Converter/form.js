export default  {
     data : `<form action="">
                    <ul class="form-list">
                        <li class="item">
                            <span>From</span>
                            <label for="from-field"><input type="number" id="from-field" min ="1" value="1"/></label>
                            <span>
                                <select name="from-currency-name" id="from-currency-name" class="select-currency">
                                    OPTION
                                </select>
                            </span>
                        </li>
                        <li>
                            <span>To</span>
                            <label for="to-field"><input type="number" id="to-field" min = "1"/ ></label>
                            <span>
                                <select name="to-currency-name" id="to-currency-name" class="select-currency">
                                    OPTION
                                </select>
                            </span>
                        </li>
                        <li>
                           
                            <label for="from-field"><input type="submit" id="submit" value="Convert" /></label>
                            
                        </li>
                    </ul>
                </form>`
 };
